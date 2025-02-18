from fastapi import APIRouter, Depends, HTTPException, status, Request, Security
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import jwt
import datetime
import os
from database import SessionLocal
from models import User, UserRole
from pydantic import BaseModel, EmailStr
from functools import wraps
from fastapi.security import OAuth2PasswordBearer

# Configuración de JWT
SECRET_KEY = os.getenv("SECRET_KEY", "supersecreto")
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# 📌 Función para obtener sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 📌 Modelos Pydantic
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.user  # 🆕 Por defecto será "user"
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# 📌 Funciones de autenticación
def get_password_hash(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: datetime.timedelta = None):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + (expires_delta or datetime.timedelta(hours=24))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# 📌 Middleware para proteger rutas privadas con roles
def get_current_user(token: str = Security(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None or role is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido.")
        return {"email": email, "role": role}
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado.")

# 📌 Decorador para requerir un rol específico
def require_role(required_role):
    def decorator(func):
        @wraps(func)
        async def wrapper(request: Request, current_user: dict = Depends(get_current_user), *args, **kwargs):
            if current_user["role"] != required_role:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado.")
            return await func(request, current_user, *args, **kwargs)
        return wrapper
    return decorator

# 📌 Endpoint para registrar usuarios
@router.post("/register", response_model=TokenResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    if user.role not in UserRole.__members__.values():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rol inválido.")

    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El usuario ya existe.")

    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password, role=user.role)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.email, "role": new_user.role})
    return {"access_token": access_token, "token_type": "bearer"}

# 📌 Endpoint para login
@router.post("/login", response_model=TokenResponse)
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas.")

    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas.")

    access_token = create_access_token(data={"sub": db_user.email, "role": db_user.role})
    return {"access_token": access_token, "token_type": "bearer"}

# 📌 Endpoint protegido para obtener información del usuario autenticado
@router.get("/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    return {"message": "Usuario autenticado", "user": current_user}

# 📌 Endpoint protegido solo para administradores
@router.get("admin-only")
@require_role("admin")
async def admin_dashboard(request: Request, current_user: dict = Depends(get_current_user)):
    return {"message": "Bienvenido, administrador", "user": current_user}

# 📌 Endpoint protegido solo para usuarios comunes
@router.get("/user-projects")
@require_role("user")
async def user_projects(request: Request, current_user: dict = Depends(get_current_user)):
    return {"message": "Accediendo a tus proyectos", "user": current_user}

# 📌 Endpoint protegido solo para invitados
@router.get("/guest-access")
@require_role("guest")
async def guest_access(request: Request, current_user: dict = Depends(get_current_user)):
    return {"message": "Acceso limitado para invitados", "user": current_user}
