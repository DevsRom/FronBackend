import logging
import os
import re
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from scipy.interpolate import griddata
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import Optional
import json  # Para leer el archivo de usuarios

# Configurar logging
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s")

app = FastAPI()

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Solo permite localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de JWT
SECRET_KEY = "tu_clave_secreta"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Configuración de seguridad
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Modelo de usuario
class User(BaseModel):
    email: str
    role: str

# Modelo de token
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str  # Añadimos el rol en la respuesta del token

# Modelo de datos de token
class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# Modelo para el registro de usuarios
class RegisterRequest(BaseModel):
    email: str
    password: str

# Función para leer usuarios desde un archivo JSON
def read_users():
    try:
        with open("user.json", "r") as file:  # Asegúrate de que el archivo esté en la raíz del proyecto
            users = json.load(file)
        return users
    except FileNotFoundError:
        return []

# Función para escribir usuarios en un archivo JSON
def write_users(users):
    with open("user.json", "w") as file:
        json.dump(users, file)

# Función para verificar la contraseña
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Función para obtener el hash de la contraseña
def get_password_hash(password):
    return pwd_context.hash(password)

# Función para obtener el usuario desde la base de datos
def get_user(email: str):
    users = read_users()
    user = next((u for u in users if u["email"] == email), None)
    return user

# Función para autenticar al usuario
def authenticate_user(email: str, password: str):
    user = get_user(email)
    if not user or not verify_password(password, user["password"]):
        return None
    return user

# Función para crear un token de acceso
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Ruta para obtener el token de acceso
@app.post("/api/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user["role"]}

# Ruta para registrar un nuevo usuario
@app.post("/api/register")
async def register(request: RegisterRequest):
    users = read_users()
    if get_user(request.email):
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    hashed_password = get_password_hash(request.password)
    new_user = {"email": request.email, "password": hashed_password, "role": "user"}
    users.append(new_user)
    write_users(users)
    return {"message": "Usuario registrado exitosamente"}

# Middleware para verificar el token
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autorizado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email, role=role)
    except JWTError:
        raise credentials_exception
    user = get_user(email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

# Middleware para verificar si el usuario es Super Usuario
async def is_super_user(current_user: User = Depends(get_current_user)):
    if current_user["role"] != "superuser":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
    return current_user

# 📂 Definir rutas de almacenamiento
PROJECTS_DIR = "data/projects"
STATIC_DIR = "static"

# 📌 Asegurar que las carpetas existen
for directory in [PROJECTS_DIR, STATIC_DIR, os.path.join(STATIC_DIR, "projects")]:
    os.makedirs(directory, exist_ok=True)

# 📌 Habilitar el servicio de archivos estáticos
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# 🔹 Función para limpiar nombres de proyectos
def clean_project_name(name: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_\-]", "_", name).strip()

@app.get("/api/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {"user": current_user}

# 📌 Endpoint para listar proyectos existentes
@app.get("/api/projects")
async def list_projects(current_user: User = Depends(get_current_user)):
    try:
        return {"projects": os.listdir(PROJECTS_DIR)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener proyectos: {str(e)}")

# 📌 Endpoint para crear un nuevo proyecto
@app.post("/api/new_project")
async def create_project(name: str, overwrite: bool = False, current_user: User = Depends(is_super_user)):
    name = clean_project_name(name)
    if not name:
        raise HTTPException(status_code=400, detail="Nombre de proyecto inválido.")

    project_path = os.path.join(PROJECTS_DIR, name)

    if os.path.exists(project_path) and not overwrite:
        return {"warning": f"El proyecto '{name}' ya existe. ¿Desea sobrescribirlo?"}

    os.makedirs(project_path, exist_ok=True)
    return {"message": f"Proyecto '{name}' creado correctamente"}

# 📌 Endpoint para subir archivos CSV
@app.post("/api/bathymetry/upload/{project_name}")
async def upload_bathymetry(project_name: str, file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    project_name = clean_project_name(project_name)
    project_path = os.path.join(PROJECTS_DIR, project_name)

    if not os.path.exists(project_path):
        os.makedirs(project_path, exist_ok=True)
        logging.info(f"📂 Carpeta creada para el proyecto: {project_path}")

    file_location = os.path.join(project_path, file.filename)

    try:
        # Guardar archivo en la carpeta del proyecto
        with open(file_location, "wb") as f:
            f.write(file.file.read())

        logging.info(f"📄 Archivo guardado en: {file_location}")

        # 📌 Leer el CSV y mostrar los nombres de las columnas detectadas
        df = pd.read_csv(file_location)

        logging.debug(f"🔍 Columnas detectadas en el archivo CSV recibido: {df.columns.tolist()}")
        logging.debug(f"🔍 Primeras filas del archivo CSV recibido:\n{df.head()}")

        if df.empty:
            raise HTTPException(status_code=400, detail="El archivo CSV está vacío.")

        # Renombrar las columnas según lo seleccionado por el usuario
        df = df.rename(columns={
            "latitude": "latitude",
            "longitude": "longitude",
            "depth": "depth"
        })

        required_columns = {"latitude", "longitude", "depth"}
        missing_columns = required_columns - set(df.columns)

        if missing_columns:
            raise HTTPException(status_code=400, detail=f"Faltan columnas en el CSV recibido: {missing_columns}")

        return {
            "message": "Archivo procesado correctamente",
            "total_points": len(df),
            "data": df.to_dict(orient="records")  # Devuelve los datos como un array de objetos
        }

    except Exception as e:
        logging.error(f"❌ Error al procesar el archivo CSV: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# 📌 Endpoint para obtener datos batimétricos
@app.get("/api/bathymetry/data/{project_name}")
async def get_bathymetry_data(project_name: str, current_user: User = Depends(get_current_user)):
    project_name = clean_project_name(project_name)
    project_path = os.path.join(PROJECTS_DIR, project_name)

    if not os.path.exists(project_path):
        raise HTTPException(status_code=404, detail=f"El proyecto '{project_name}' no existe.")

    files = sorted([f for f in os.listdir(project_path) if f.endswith(".csv")])
    if not files:
        raise HTTPException(status_code=404, detail="No hay archivos de datos en este proyecto.")

    df = pd.read_csv(os.path.join(project_path, files[-1]))
    if df.empty:
        raise HTTPException(status_code=404, detail="El archivo CSV no contiene datos.")

    return {"points": df.to_dict(orient="records")}

# 📌 Endpoint para generar modelo 3D
@app.get("/api/bathymetry/model/{project_name}")
async def generate_3d_model(project_name: str, current_user: User = Depends(get_current_user)):
    project_name = clean_project_name(project_name)
    project_path = os.path.join(PROJECTS_DIR, project_name)

    if not os.path.exists(project_path):
        raise HTTPException(status_code=404, detail=f"El proyecto '{project_name}' no existe.")

    files = sorted([f for f in os.listdir(project_path) if f.endswith(".csv")])
    if not files:
        raise HTTPException(status_code=404, detail="No hay archivos de datos en este proyecto.")

    df = pd.read_csv(os.path.join(project_path, files[-1]))
    if df.empty:
        raise HTTPException(status_code=404, detail="El archivo CSV no contiene datos.")

    df = df.astype({"latitude": "float64", "longitude": "float64", "depth": "float64"}).dropna()

    project_static_path = os.path.join(STATIC_DIR, "projects", project_name)
    os.makedirs(project_static_path, exist_ok=True)

    # 🔹 Interpolación de datos
    grid_x, grid_y = np.meshgrid(
        np.linspace(df["longitude"].min(), df["longitude"].max(), 100),
        np.linspace(df["latitude"].min(), df["latitude"].max(), 100)
    )
    grid_z = griddata((df["longitude"], df["latitude"]), df["depth"], (grid_x, grid_y), method="cubic")

    fig = go.Figure(data=[go.Surface(z=grid_z, x=grid_x, y=grid_y, colorscale="Viridis")])
    fig.update_layout(title=f"Modelo 3D - {project_name}", autosize=True)

    model_filename = f"{project_name}_modelo_3d.html"
    model_path = os.path.join(project_static_path, model_filename)

    try:
        fig.write_html(model_path)
        logging.info(f"✅ Archivo HTML generado correctamente en: {model_path}")
    except Exception as e:
        logging.error(f"❌ Error al generar el archivo HTML: {str(e)}")
        raise HTTPException(status_code=500, detail="Error al generar el modelo 3D")

    return {"message": "Modelo 3D generado exitosamente.", "file_url": f"/static/projects/{project_name}/{model_filename}"}

# 📌 Endpoint de prueba
@app.get("/api/test")
def test_api():
    return {"message": "API funcionando correctamente"}

# 📌 Ruta raíz
@app.get("/")
def read_root():
    return {"message": "Backend funcionando correctamente"}