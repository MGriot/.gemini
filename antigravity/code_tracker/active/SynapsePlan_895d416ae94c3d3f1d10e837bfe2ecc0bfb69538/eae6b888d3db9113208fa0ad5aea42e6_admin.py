£=from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import crud, schemas, models
from database import get_db
from .auth import get_current_active_superuser # Import from .auth to avoid circularity

router = APIRouter(prefix="/admin", tags=["admin"])

# --- Tag Management ---
@router.post(
    "/tags/",
    response_model=schemas.Tag,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new tag",
    description="Allows superusers to create a new tag. Tag names must be unique."
)
def create_tag(
    tag: schemas.TagCreate,
    db: Annotated[Session, Depends(get_db)],
    current_superuser: Annotated[models.User, Depends(get_current_active_superuser)],
):
    db_tag = crud.get_tag_by_name(db, name=tag.name)
    if db_tag:
        raise HTTPException(status_code=400, detail="Tag name already registered")
    return crud.create_tag(db=db, tag=tag)

@router.get(
    "/tags/",
    response_model=list[schemas.Tag],
    summary="Get all tags",
    description="Retrieves a list of all existing tags. Requires superuser privileges."
)
def read_tags(
    db: Annotated[Session, Depends(get_db)],
    current_superuser: Annotated[models.User, Depends(get_current_active_superuser)],
    skip: int = 0, limit: int = 100
):
    tags = crud.get_tags(db, skip=skip, limit=limit)
    return tags

@router.get(
    "/tags/{tag_id}",
    response_model=schemas.Tag,
    summary="Get a tag by ID",
    description="Retrieves a specific tag by its ID. Requires superuser privileges."
)
def read_tag(
    tag_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_superuser: Annotated[models.User, Depends(get_current_active_superuser)],
):
    db_tag = crud.get_tag(db, tag_id=tag_id)
    if db_tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    return db_tag

@router.put(
    "/tags/{tag_id}",
    response_model=schemas.Tag,
    summary="Update an existing tag",
    description="Allows superusers to update an existing tag's name. Tag names must remain unique."
)
def update_tag(
    tag_id: int,
    tag: schemas.TagCreate,
    db: Annotated[Session, Depends(get_db)],
    current_superuser: Annotated[models.User, Depends(get_current_active_superuser)],
):
    db_tag = crud.get_tag(db, tag_id=tag_id)
    if db_tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    return crud.update_tag(db=db, tag_id=tag_id, tag=tag)

@router.delete(
    "/tags/{tag_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a tag",
    description="Allows superusers to delete a specific tag by its ID."
)
def delete_tag(
    tag_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_superuser: Annotated[models.User, Depends(get_current_active_superuser)],
):
    db_tag = crud.get_tag(db, tag_id=tag_id)
    if db_tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    crud.delete_tag(db=db, tag_id=tag_id)
    return

# --- Topic Management ---
@router.post(
    "/topics/",
    response_model=schemas.Topic,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new topic",
    description="Allows superusers to create a new topic. Topic names must be unique."
)
def create_topic(
    topic: schemas.TopicCreate,
    db: Annotated[Session, Depends(get_db)],
    current_superuser: Annotated[models.User, Depends(get_current_active_superuser)],
):
    db_topic = crud.get_topic_by_name(db, name=topic.name)
    if db_topic:
        raise HTTPException(status_code=400, detail="Topic name already registered")
    return crud.create_topic(db=db, topic=topic)

@router.get(
    "/topics/",
    response_model=list[schemas.Topic],
    summary="Get all topics",
    description="Retrieves a list of all existing topics. Requires superuser privileges."
)
def read_topics(
    db: Annotated[Session, Depends(get_db)],
    current_superuser: Annotated[models.User, Depends(get_current_active_superuser)],
    skip: int = 0, limit: int = 100
):
    topics = crud.get_topics(db, skip=skip, limit=limit)
    return topics

@router.get(
    "/topics/{topic_id}",
    response_model=schemas.Topic,
    summary="Get a topic by ID",
    description="Retrieves a specific topic by its ID. Requires superuser privileges."
)
def read_topic(
    topic_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_superuser: Annotated[models.User, Depends(get_current_active_superuser)],
):
    db_topic = crud.get_topic(db, topic_id=topic_id)
    if db_topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    return db_topic

@router.put(
    "/topics/{topic_id}",
    response_model=schemas.Topic,
    summary="Update an existing topic",
    description="Allows superusers to update an existing topic's name. Topic names must remain unique."
)
def update_topic(
    topic_id: int,
    topic: schemas.TopicCreate,
    db: Annotated[Session, Depends(get_db)],
    current_superuser: Annotated[models.User, Depends(get_current_active_superuser)],
):
    db_topic = crud.get_topic(db, topic_id=topic_id)
    if db_topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    return crud.update_topic(db=db, topic_id=topic_id, topic=topic)

@router.delete(
    "/topics/{topic_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a topic",
    description="Allows superusers to delete a specific topic by its ID."
)
def delete_topic(
    topic_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_superuser: Annotated[models.User, Depends(get_current_active_superuser)],
):
    db_topic = crud.get_topic(db, topic_id=topic_id)
    if db_topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    crud.delete_topic(db=db, topic_id=topic_id)
    return

# --- User Management ---
@router.get("/users/", response_model=list[schemas.User])
def read_all_users(
    db: Annotated[Session, Depends(get_db)],
    current_superuser: Annotated[models.User, Depends(get_current_active_superuser)],
    skip: int = 0, limit: int = 100
):
    return crud.get_users(db, skip=skip, limit=limit)

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_admin(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_superuser: Annotated[models.User, Depends(get_current_active_superuser)],
):
    crud.delete_user(db, user_id=user_id)
    return

# --- Project Management ---
@router.get("/projects/", response_model=list[schemas.Project])
def read_all_projects_admin(
    db: Annotated[Session, Depends(get_db)],
    current_superuser: Annotated[models.User, Depends(get_current_active_superuser)],
    skip: int = 0, limit: int = 100
):
    return db.query(models.Project).offset(skip).limit(limit).all()

@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_admin(
    project_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_superuser: Annotated[models.User, Depends(get_current_active_superuser)],
):
    crud.delete_project(db, project_id=project_id)
    return

# --- Task Management ---
@router.get("/tasks/", response_model=list[schemas.Task])
def read_all_tasks_admin(
    db: Annotated[Session, Depends(get_db)],
    current_superuser: Annotated[models.User, Depends(get_current_active_superuser)],
    skip: int = 0, limit: int = 100
):
    return db.query(models.Task).offset(skip).limit(limit).all()

@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_admin(
    task_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_superuser: Annotated[models.User, Depends(get_current_active_superuser)],
):
    crud.delete_task(db, task_id=task_id)
    return
£=*cascade08"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Lfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/routers/admin.py:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan