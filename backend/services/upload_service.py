import os
import uuid
import shutil
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import UploadFile as FastAPIUploadFile
from models.upload import Upload, UploadFile, PipelineRun
from models.invoice import Invoice
from models.vendor import Vendor
from models.buyer import Buyer
from models.user import User
from services.csv_parser import parse_and_validate_csv
from schemas.upload import UploadResponse, UploadResultResponse

UPLOAD_DIR = "./uploads"

def process_upload(db: Session, files: list[FastAPIUploadFile], current_user: User) -> UploadResultResponse:
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    run = PipelineRun(organization_id=current_user.organization_id, status="Running", started_at=datetime.utcnow())
    db.add(run)
    db.commit()

    upload_ids = []
    
    for file in files:
        # Save file to disk
        file_ext = file.filename.split('.')[-1]
        disk_filename = f"{uuid.uuid4()}.{file_ext}"
        filepath = os.path.join(UPLOAD_DIR, disk_filename)
        
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Parse CSV
        is_valid, msg, records = parse_and_validate_csv(filepath)
        
        status = "Uploaded" if is_valid else "Failed"
        
        # Create Upload Record
        db_upload = Upload(
            organization_id=current_user.organization_id,
            pipeline_run_id=run.id,
            file_name=file.filename,
            file_type="GSTR-1" if "gstr1" in file.filename.lower() else "GSTR-2B",
            status=status,
            row_count=len(records) if is_valid else 0,
            uploaded_by_user_id=current_user.id,
            uploaded_at=datetime.utcnow()
        )
        db.add(db_upload)
        db.commit()
        db.refresh(db_upload)
        upload_ids.append(db_upload.id)
        
        # If valid, insert invoices (basic ingestion)
        if is_valid:
            for rec in records:
                # Canonical Key
                canonical_key = f"{rec['vendor_gstin']}-{rec['buyer_gstin']}-{rec['invoice_number']}-{rec['financial_year']}-{rec['doc_type']}"
                
                # Check if invoice exists to deduplicate
                existing_inv = db.query(Invoice).filter(
                    Invoice.organization_id == current_user.organization_id,
                    Invoice.canonical_key == canonical_key
                ).first()
                
                if not existing_inv:
                    inv = Invoice(
                        organization_id=current_user.organization_id,
                        upload_id=db_upload.id,
                        canonical_key=canonical_key,
                        invoice_number=str(rec['invoice_number']),
                        financial_year=str(rec['financial_year']),
                        doc_type=str(rec['doc_type']),
                        vendor_id=rec['vendor_gstin'], # using gstin as temp vendor ID for now
                        buyer_id=rec['buyer_gstin'],
                        taxable_value=rec['taxable_value'],
                        igst=rec['igst'],
                        cgst=rec['cgst'],
                        sgst=rec['sgst'],
                        invoice_value=rec['invoice_value'],
                        source=rec['source']
                    )
                    db.add(inv)
            db.commit()
            
    run.status = "Completed"
    run.completed_at = datetime.utcnow()
    db.commit()
    
    # AUTONOMOUS WORKFLOW: Automatically trigger reconciliation engine after successful upload
    if upload_ids:
        from schemas.reconciliation import RunReconciliationRequest
        from services.reconciliation_engine import run_reconciliation
        
        req = RunReconciliationRequest(uploadIds=upload_ids, periodStart="", periodEnd="")
        run_reconciliation(db, req, current_user)

    return UploadResultResponse(uploadIds=upload_ids, message="Files processed successfully", pipelineRunId=run.id)

def list_uploads(db: Session, org_id: str):
    uploads = db.query(Upload).filter(Upload.organization_id == org_id, Upload.archived_at == None).order_by(Upload.uploaded_at.desc()).all()
    return [
        UploadResponse(
            id=u.id, fileName=u.file_name, fileType=u.file_type, 
            status=u.status, uploadedAt=u.uploaded_at, rowCount=u.row_count
        ) for u in uploads
    ]

def delete_upload(db: Session, upload_id: str, current_user: User):
    upload = db.query(Upload).filter(Upload.id == upload_id, Upload.organization_id == current_user.organization_id).first()
    if upload:
        upload.archived_at = datetime.utcnow()
        upload.archived_by_user_id = current_user.id
        db.commit()
    return {"deleted": True, "uploadId": upload_id, "archived": True}
