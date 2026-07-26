# Imports
# ---
from datetime import datetime, timedelta, UTC
from jose import jwt
from pwdlib import PasswordHash
# ---

# Method
# ---
password_hash = PasswordHash.recommended()
# ---

# Local Constants
# ---
SECRET_KEY = "test-thingymadoodle"
ALGORITHM = "HS256"
EXPIRATION_TIME = 60
# ---

# Hash
# ---
def hash_password(password: str) -> str:
    return password_hash.hash(password)
# ---

# Verify
# ---
def verify_password(password: str, hashed: str) -> bool:
    return password_hash.verify(password, hashed)
# ---

# Create Token
# ---
def create_access_token(data: dict, expiration_time_minutes: int = EXPIRATION_TIME) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(UTC) + timedelta(minutes=EXPIRATION_TIME)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
# ---