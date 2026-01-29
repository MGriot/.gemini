±
import os
import sys
from sqlalchemy.orm import Session

# Ensure the project root is in the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# We will import necessary modules inside the functions to control the load order
def init_admin(db: Session):
    """
    Initializes the admin user, after deleting all existing users.
    """
    from models.user import User as UserModel
    from schemas import user as user_schema
    from crud import user as user_crud

    # Delete all existing users
    num_deleted = db.query(UserModel).delete()
    db.commit()
    if num_deleted > 0:
        print(f"Successfully deleted {num_deleted} user(s).")

    # Create new admin user
    admin_email = "admin@synapseplan.com"
    admin_password = "admin"
    admin_user_in = user_schema.UserCreate(
        email=admin_email,
        password=admin_password,
        name="Admin",
        surname="User",
        nickname="SuperAdmin"
    )
    
    print("Creating new admin user...")
    db_user = user_crud.create_user(db=db, user=admin_user_in)
    db_user.is_superuser = True

    db.commit()
    db.refresh(db_user)

    print("Admin user successfully configured:")
    print(f"  Email: {db_user.email}")
    print(f"  Password: {admin_password}")
    print(f"  Superuser: {db_user.is_superuser}")


if __name__ == "__main__":
    from database import SessionLocal, engine, Base
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        init_admin(db)
    finally:
        db.close()
±"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Ifile:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/init_admin.py:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan