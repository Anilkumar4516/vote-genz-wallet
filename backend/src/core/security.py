import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any
import jwt
import bcrypt
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from src.core.config import get_settings

settings = get_settings()

# AES-256 Key derivation from master election secret
AES_KEY = hashlib.sha256(settings.ELECTION_MASTER_SECRET.encode()).digest()


def hash_password(password: str) -> str:
    """Hashes a password using Bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against its Bcrypt hash."""
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(subject: str | Any, expires_delta: timedelta | None = None) -> str:
    """Creates a signed JWT access token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"sub": str(subject), "exp": expire, "type": "access"}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict[str, Any] | None:
    """Decodes and validates a JWT token."""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except jwt.PyJWTError:
        return None


def generate_otp() -> str:
    """Generates a cryptographically secure 6-digit numeric OTP."""
    return f"{secrets.randbelow(900000) + 100000}"


def encrypt_ballot_choice(choice_text: str) -> str:
    """Encrypts candidate ballot choice with AES-256-CBC."""
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(AES_KEY), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    
    # PKCS7 padding
    raw_data = choice_text.encode("utf-8")
    pad_len = 16 - (len(raw_data) % 16)
    padded_data = raw_data + bytes([pad_len] * pad_len)
    
    encrypted = encryptor.update(padded_data) + encryptor.finalize()
    return f"{iv.hex()}:{encrypted.hex()}"


def decrypt_ballot_choice(encrypted_choice: str) -> str | None:
    """Decrypts AES-256-CBC encrypted ballot choice."""
    try:
        parts = encrypted_choice.split(":")
        iv = bytes.fromhex(parts[0])
        encrypted_bytes = bytes.fromhex(parts[1])
        
        cipher = Cipher(algorithms.AES(AES_KEY), modes.CBC(iv), backend=default_backend())
        decryptor = cipher.decryptor()
        decrypted_padded = decryptor.update(encrypted_bytes) + decryptor.finalize()
        
        # PKCS7 unpadding
        pad_len = decrypted_padded[-1]
        return decrypted_padded[:-pad_len].decode("utf-8")
    except Exception:
        return None
