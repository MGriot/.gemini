€from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from .tag import Tag
from .topic import Topic

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    progress: float = 0.0
    status: str = "Not Started"

class ProjectCreate(ProjectBase):
    owner_id: Optional[int] = None
    tag_ids: Optional[List[int]] = []
    topic_ids: Optional[List[int]] = []

class ProjectUpdate(ProjectBase):
    name: Optional[str] = None
    tag_ids: Optional[List[int]] = []
    topic_ids: Optional[List[int]] = []

class Project(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    tags: List[Tag] = []
    topics: List[Topic] = []

    model_config = {
        "from_attributes": True
    }
“ “¶*cascade08
¶€ "(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Nfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/schemas/project.py:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan