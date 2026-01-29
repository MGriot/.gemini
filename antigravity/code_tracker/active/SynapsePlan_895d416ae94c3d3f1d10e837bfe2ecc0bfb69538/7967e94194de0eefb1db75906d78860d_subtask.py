±from __future__ import annotations # Required for forward references
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from .dependency import Dependency # Import Dependency schema
from .tag import Tag # Import Tag schema
from .topic import Topic # Import Topic schema

class SubtaskBase(BaseModel):
    name: str
    description: Optional[str] = None
    parent_task_id: Optional[int] = None # Now nullable
    parent_subtask_id: Optional[int] = None # New field
    owner_id: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    progress: float = 0.0
    status: str = "Not Started"

class SubtaskCreate(SubtaskBase):
    tag_ids: Optional[List[int]] = []
    topic_ids: Optional[List[int]] = []

class SubtaskUpdate(SubtaskBase):
    name: Optional[str] = None
    parent_task_id: Optional[int] = None
    parent_subtask_id: Optional[int] = None # New field
    owner_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None
    topic_ids: Optional[List[int]] = None

class Subtask(SubtaskBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    dependencies_as_prerequisite: List[Dependency] = [] # Subtask is a prerequisite for these
    dependencies_as_dependent: List[Dependency] = []    # Subtask is dependent on these
    tags: List[Tag] = []
    topics: List[Topic] = []
    nested_subtasks: List['Subtask'] = [] # For nested subtasks

    model_config = {
        "from_attributes": True
    }

Subtask.model_rebuild() # Rebuild for forward reference
±"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Nfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/schemas/subtask.py:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan