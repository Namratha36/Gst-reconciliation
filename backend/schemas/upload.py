from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UploadResponse(BaseModel):
    id: str
    fileName: str
    fileType: str
    status: str
    uploadedAt: datetime
    rowCount: int

class UploadListResponse(BaseModel):
    data: List[UploadResponse]

class UploadResultResponse(BaseModel):
    uploadIds: List[str]
    message: str
    pipelineRunId: Optional[str] = None

class DeleteResponse(BaseModel):
    deleted: bool
    uploadId: str
    archived: bool
