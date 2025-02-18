from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.ext.declarative import declarative_base
from database import Base  # Importamos Base desde database.py
import enum

# Definimos los roles disponibles
class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"
    guest = "guest"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.user)  # 🆕 Rol del usuario
