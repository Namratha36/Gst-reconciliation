from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from database.postgres import get_db
from schemas.upload import UploadResponse, UploadResultResponse, DeleteResponse
from services import upload_service
from core.dependencies import get_current_user
from models.user import User

router = APIRouter()

@router.post("/csv", response_model=UploadResultResponse)
def upload_csv(
    files: List[UploadFile] = File(...), 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    return upload_service.process_upload(db, files, current_user)

@router.get("", response_model=List[UploadResponse])
def get_uploads(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return upload_service.list_uploads(db, current_user.organization_id)

@router.delete("/{upload_id}", response_model=DeleteResponse)
def archive_upload(upload_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return upload_service.delete_upload(db, upload_id, current_user)
