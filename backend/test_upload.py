import sys
from fastapi import UploadFile
from sqlalchemy.orm import Session
from database.postgres import SessionLocal
from models.user import User
from services.upload_service import process_upload
import glob
import os

db = SessionLocal()
try:
    user = db.query(User).first()
    if not user:
        print("No user found")
        sys.exit(1)
        
    csv_files = glob.glob('uploads/*.csv')
    latest_file = max(csv_files, key=os.path.getctime)
    
    with open(latest_file, "rb") as f:
        file_obj = UploadFile(filename="GSTR1.csv - Sheet1.csv", file=f)
        try:
            res = process_upload(db, [file_obj], user)
            print("Process Upload Result:", res)
        except Exception as e:
            print("Exception during process_upload:", e)
            import traceback
            traceback.print_exc()
finally:
    db.close()
