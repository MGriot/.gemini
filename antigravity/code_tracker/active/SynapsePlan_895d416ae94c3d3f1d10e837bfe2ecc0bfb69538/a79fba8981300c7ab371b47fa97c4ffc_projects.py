õ;from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import crud, schemas, models
from database import get_db
from .auth import get_current_active_user
from utils.permissions import check_project_access

router = APIRouter()

@router.post("/", response_model=schemas.Project, status_code=status.HTTP_201_CREATED,
            summary="Create a new project",
            description="Allows an authenticated user to create a new project with optional tags and topics.")
def create_project(
    project: schemas.ProjectCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    owner_id = project.owner_id if project.owner_id else current_user.id
    return crud.create_user_project(db=db, project=project, owner_id=owner_id)

@router.get("/", response_model=list[schemas.Project],
            summary="Retrieve a list of all projects for the current user",
            description="Returns all projects owned by the authenticated user or shared with them.")
def read_projects(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
    skip: int = 0,
    limit: int = 100,
):
    projects = crud.get_projects(db, owner_id=current_user.id, skip=skip, limit=limit)
    return projects

@router.get("/summary_gantt/", response_model=list[schemas.Project],
            summary="Retrieve all projects with tasks and subtasks for summary Gantt chart",
            description="Returns all projects accessible to the current user, with their nested tasks and subtasks eagerly loaded for timeline visualization.")
def get_summary_gantt_data(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    # This endpoint does not require project-specific permissions as it aggregates all user-accessible projects.
    # The CRUD function already filters by user_id for owned/shared projects.
    projects = crud.get_all_projects_with_tasks_and_subtasks_eager_loaded(db, current_user.id)
    return projects

@router.get("/{project_id}", response_model=schemas.Project,
            summary="Retrieve a specific project by ID",
            description="Returns a single project if the authenticated user has view access to it.")
def read_project(
    project_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    return check_project_access(db, project_id, current_user.id, min_role="view")

@router.put("/{project_id}", response_model=schemas.Project,
            summary="Update an existing project",
            description="Allows a user with edit access to update an existing project's details, including tags and topics.")
def update_project(
    project_id: int,
    project: schemas.ProjectUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    check_project_access(db, project_id, current_user.id, min_role="edit")
    return crud.update_project(db=db, project_id=project_id, project=project)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT,
            summary="Delete a project",
            description="Allows the project owner to delete a project.")
def delete_project(
    project_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    db_project = crud.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if db_project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")
    crud.delete_project(db=db, project_id=project_id)
    return

@router.post("/{project_id}/share", response_model=schemas.ProjectShare, status_code=status.HTTP_201_CREATED,
            summary="Share a project with another user",
            description="Allows the project owner to share a project with another user, granting specific permissions (view, edit, admin).")
def share_project(
    project_id: int,
    project_share: schemas.ProjectShareCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    db_project = crud.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if db_project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only project owners can share projects")

    # Check if the user to share with exists
    user_to_share_with = crud.get_user(db, user_id=project_share.shared_with_user_id)
    if user_to_share_with is None:
        raise HTTPException(status_code=404, detail="User to share with not found")

    # Check if already shared
    existing_share = db.query(models.ProjectShare).filter(
        models.ProjectShare.project_id == project_id,
        models.ProjectShare.shared_with_user_id == project_share.shared_with_user_id
    ).first()
    if existing_share:
        raise HTTPException(status_code=400, detail="Project already shared with this user")

    project_share.project_id = project_id
    return crud.create_project_share(db=db, project_share=project_share)

@router.get("/{project_id}/permissions", response_model=list[schemas.ProjectShare],
            summary="Retrieve sharing permissions for a project",
            description="Returns a list of users with whom the project is shared and their respective permission levels.")
def get_project_permissions(
    project_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    check_project_access(db, project_id, current_user.id, min_role="view")
    return crud.get_project_shares_for_project(db=db, project_id=project_id)

@router.get("/{project_id}/aggregated_tags_topics", response_model=dict[str, list[int]],
            summary="Retrieve all aggregated tags and topics for a project",
            description="Returns a list of unique tag and topic IDs associated with a project, including those from its tasks and subtasks.")
def get_aggregated_tags_topics_for_project(
    project_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    check_project_access(db, project_id, current_user.id, min_role="view")
    
    # Get the project with its tasks and subtasks
    project = crud.get_project_with_tasks_and_subtasks_eager_loaded(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    aggregated_tag_ids = set()
    aggregated_topic_ids = set()

    # Add project's own tags/topics
    aggregated_tag_ids.update([tag.id for tag in project.tags])
    aggregated_topic_ids.update([topic.id for topic in project.topics])

    # Aggregate from tasks and subtasks
    for task in project.tasks:
        aggregated_tag_ids.update([tag.id for tag in task.tags])
        aggregated_topic_ids.update([topic.id for topic in task.topics])
        for subtask in task.subtasks:
            aggregated_tag_ids.update([tag.id for tag in subtask.tags])
            aggregated_topic_ids.update([topic.id for topic in subtask.topics])
            
    return {
        "tag_ids": list(aggregated_tag_ids),
        "topic_ids": list(aggregated_topic_ids)
    }õ;*cascade08"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Ofile:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/routers/projects.py:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan