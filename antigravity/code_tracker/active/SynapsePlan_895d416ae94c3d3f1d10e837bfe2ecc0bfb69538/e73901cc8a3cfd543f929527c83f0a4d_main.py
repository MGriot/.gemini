ífrom fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware # Import CORSMiddleware
from routers import auth, users, projects, tasks, dependencies, attachments, comments, admin
from utils.exceptions import CustomException, NotFoundException, UnauthorizedException, ForbiddenException, BadRequestException
from config import settings
from services.reminders import start_scheduler
from loguru import logger
import sys

app = FastAPI()

# Configure loguru
logger.remove()
logger.add(sys.stderr, level=settings.LOG_LEVEL, format=settings.LOG_FORMAT)

@app.on_event("startup")
def on_startup():
    start_scheduler()

# CORS configuration
origins = [
    "http://localhost",
    "http://localhost:3000", # React development server
    "http://localhost:5173", # Vite development server
    # Add your frontend production URL here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(tasks.router, prefix="", tags=["tasks"])
app.include_router(dependencies.router, prefix="", tags=["dependencies"])
app.include_router(attachments.router, prefix="", tags=["attachments"])
app.include_router(comments.router, prefix="", tags=["comments"])
app.include_router(admin.router, prefix="", tags=["admin"])

@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    logger.error(f"Handled exception: {exc.detail} for request {request.url}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.get("/")
async def root():
    logger.info("Root endpoint accessed.")
    return {"message": "Welcome to SynapsePlan Backend!"}í"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Cfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/main.py:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan