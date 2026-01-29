Ñfrom sqlalchemy import text
from database import SessionLocal

def fix_password():
    db = SessionLocal()
    try:
        # The correct hash for 'password123'
        correct_hash = "$2b$12$NCgibhA1.anPfA4UaOHa7OPh0eBNjmcZdak9wFPJigZYswUbxSFbm"
        email = "matteo.griot@gmail.com"
        
        sql = text("UPDATE users SET hashed_password = :hash WHERE email = :email")
        result = db.execute(sql, {"hash": correct_hash, "email": email})
        db.commit()
        print(f"Updated password for {email}. Rows affected: {result.rowcount}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_password()
Ñ"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Kfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/fix_password.py:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan