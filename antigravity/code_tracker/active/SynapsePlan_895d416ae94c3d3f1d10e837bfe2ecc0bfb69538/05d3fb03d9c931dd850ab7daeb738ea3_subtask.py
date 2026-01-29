‡ from sqlalchemy.orm import Session, selectinload
from sqlalchemy import or_
import models, schemas

def get_subtask(db: Session, subtask_id: int):
    return (db.query(models.Subtask)
        .options(selectinload(models.Subtask.dependencies_as_prerequisite))
        .options(selectinload(models.Subtask.dependencies_as_dependent))
        .options(selectinload(models.Subtask.tags))
        .options(selectinload(models.Subtask.topics))
        .options(selectinload(models.Subtask.nested_subtasks))
        .filter(models.Subtask.id == subtask_id).first())

def get_subtasks(db: Session, parent_task_id: int | None = None, parent_subtask_id: int | None = None, skip: int = 0, limit: int = 100):
    query = (db.query(models.Subtask)
        .options(selectinload(models.Subtask.dependencies_as_prerequisite))
        .options(selectinload(models.Subtask.dependencies_as_dependent))
        .options(selectinload(models.Subtask.tags))
        .options(selectinload(models.Subtask.topics))
        .options(selectinload(models.Subtask.nested_subtasks)))
    
    if parent_task_id:
        query = query.filter(models.Subtask.parent_task_id == parent_task_id)
    elif parent_subtask_id:
        query = query.filter(models.Subtask.parent_subtask_id == parent_subtask_id)
    else:
        # If neither is provided, return top-level subtasks (those directly under tasks, not subtasks)
        query = query.filter(models.Subtask.parent_task_id.isnot(None), models.Subtask.parent_subtask_id.is_(None))

    return query.offset(skip).limit(limit).all()

def create_subtask(db: Session, subtask: schemas.SubtaskCreate):
    subtask_data = subtask.model_dump(exclude={"tag_ids", "topic_ids"})
    tag_ids = subtask.tag_ids
    topic_ids = subtask.topic_ids

    # Ensure only one parent is set
    if subtask_data.get("parent_task_id") is not None and subtask_data.get("parent_subtask_id") is not None:
        raise ValueError("Cannot set both parent_task_id and parent_subtask_id")
    if subtask_data.get("parent_task_id") is None and subtask_data.get("parent_subtask_id") is None:
        raise ValueError("Must set either parent_task_id or parent_subtask_id")

    db_subtask = models.Subtask(**subtask_data)
    
    if tag_ids:
        tags = db.query(models.Tag).filter(models.Tag.id.in_(tag_ids)).all()
        db_subtask.tags = tags
    
    if topic_ids:
        topics = db.query(models.Topic).filter(models.Topic.id.in_(topic_ids)).all()
        db_subtask.topics = topics

    db.add(db_subtask)
    db.commit()
    db.refresh(db_subtask)
    return db_subtask

def update_subtask(db: Session, subtask_id: int, subtask: schemas.SubtaskUpdate):
    db_subtask = (db.query(models.Subtask)
        .options(selectinload(models.Subtask.tags))
        .options(selectinload(models.Subtask.topics))
        .filter(models.Subtask.id == subtask_id).first())
    if not db_subtask:
        return None
        
    subtask_data = subtask.model_dump(exclude_unset=True, exclude={"tag_ids", "topic_ids"})
    tag_ids = subtask.tag_ids
    topic_ids = subtask.topic_ids

    # Ensure parent IDs are not conflicting
    if "parent_task_id" in subtask_data and "parent_subtask_id" in subtask_data:
        if subtask_data["parent_task_id"] is not None and subtask_data["parent_subtask_id"] is not None:
            raise ValueError("Cannot set both parent_task_id and parent_subtask_id")

    for var, value in subtask_data.items():
        setattr(db_subtask, var, value)
    
    if tag_ids is not None:
        tags = db.query(models.Tag).filter(models.Tag.id.in_(tag_ids)).all()
        db_subtask.tags = tags
    
    if topic_ids is not None:
        topics = db.query(models.Topic).filter(models.Topic.id.in_(topic_ids)).all()
        db_subtask.topics = topics

    db.add(db_subtask)
    db.commit()
    db.refresh(db_subtask)
    return db_subtask

def delete_subtask(db: Session, subtask_id: int):
    db_subtask = db.query(models.Subtask).filter(models.Subtask.id == subtask_id).first()
    if not db_subtask:
        return None
    db.delete(db_subtask)
    db.commit()
    return db_subtask‡ "(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Kfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/crud/subtask.py:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan