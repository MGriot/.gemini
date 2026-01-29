—from passlib.context import CryptContext
ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
hash_from_db = "$2b$12$NCgibhA1.anPfA4UaOHa7OPh0eBNjmcZdak9wFPJigZYswUbxSFbm"
password = "password123"
print(f"Hash: {hash_from_db}")
print(f"Password: {password}")
try:
    result = ctx.verify(password, hash_from_db)
    print(f"Result: {result}")
except Exception as e:
    print(f"Error: {e}")
—"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Jfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/backend/verify_hash.py:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan