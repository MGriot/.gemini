¨'from datetime import timedelta, datetime # Import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

import crud # Corrected import
import models # Corrected import
import schemas # Corrected import
from database import get_db
from config import settings

router = APIRouter()

from utils.security import pwd_context, oauth2_scheme, verify_password, get_password_hash

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Annotated[Session, Depends(get_db)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: Annotated[models.User, Depends(get_current_user)]):
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user

async def get_current_active_superuser(
    current_user: Annotated[models.User, Depends(get_current_active_user)],
):
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not a superuser"
        )
    return current_user

@router.post(
    "/register",
    response_model=schemas.User,
    summary="Register a new user",
    description="Registers a new user with the provided email and password."
)
def register_user(user: schemas.UserCreate, db: Annotated[Session, Depends(get_db)]):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    return crud.create_user(db=db, user=user, hashed_password=hashed_password)

@router.post(
    "/token",
    response_model=schemas.Token,
    summary="Obtain access token",
    description="Authenticates a user and returns an access token."
)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Annotated[Session, Depends(get_db)]):
    print(f"DEBUG: Login attempt for username: '{form_data.username}'")
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user:
        print(f"DEBUG: User not found: {form_data.username}")
    else:
        print(f"DEBUG: User found. ID: {user.id}, Hash in DB: {user.hashed_password}")
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        print("DEBUG: Authentication failed.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    print("DEBUG: Authentication successful.")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get(
    "/users/me/",
    response_model=schemas.User,
    summary="Get current user",
    description="Retrieves the details of the currently authenticated user."
)
async def read_users_me(current_user: Annotated[models.User, Depends(get_current_active_user)]):
    return current_user

@router.get(
    "/token/refresh",
    response_model=schemas.Token,
    summary="Refresh access token",
    description="Refreshes the access token for the currently authenticated user."
)
async def refresh_token(current_user: Annotated[models.User, Depends(get_current_active_user)]):
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}” ”½*cascade08
½¨' "(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Kfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/routers/auth.py:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan