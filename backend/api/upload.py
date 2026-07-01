import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from typing import List

from services.csv_processor import process_gstr1, process_gstr2b
from services.graph_builder import build_graph_from_gstr1, build_graph_from_gstr2b

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def process_uploaded_files(file_paths: List[str], user_gstin: str):
    for path in file_paths:
        filename = os.path.basename(path).lower()
        try:
            if filename.startswith("gstr1"):
                df = process_gstr1(path)
                build_graph_from_gstr1(df, user_gstin)
            elif filename.startswith("gstr2b"):
                df = process_gstr2b(path)
                build_graph_from_gstr2b(df, user_gstin)
            # Add gstr3b logic similarly if needed
        except Exception as e:
            print(f"Error processing {path}: {e}")

@router.post("/csv")
async def upload_csv_files(background_tasks: BackgroundTasks, files: List[UploadFile] = File(...)):
    # In a real app, user_gstin would come from JWT or user profile.
    # We mock it for the pipeline.
    user_gstin = "07AAGFF2194N1Z1" 
    
    file_paths = []
    
    for file in files:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not a CSV.")
        
        valid_prefixes = ("gstr1", "gstr2b", "gstr3b")
        if not file.filename.lower().startswith(valid_prefixes):
            raise HTTPException(status_code=400, detail=f"File {file.filename} must be GSTR1, GSTR2B, or GSTR3B CSV.")
            
        file_location = f"{UPLOAD_DIR}/{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
            
        file_paths.append(file_location)
        
    background_tasks.add_task(process_uploaded_files, file_paths, user_gstin)
        
    return {"message": "Files uploaded successfully and processing started in background.", "files": [f.filename for f in files]}

