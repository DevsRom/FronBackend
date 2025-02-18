import logging
import os
import re
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from scipy.interpolate import griddata
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from UserRegister import router as user_router
import models
from database import Base, engine

# Configurar logging
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s")

app = FastAPI()

# 📌 Crear la base de datos si no existe
Base.metadata.create_all(bind=engine)

# 📌 Incluir las rutas de autenticación y usuarios
app.include_router(user_router, prefix="/api")

# 📌 Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# 📌 Endpoint para listar proyectos existentes
@app.get("/api/projects")
def list_projects():
    try:
        return {"projects": os.listdir(PROJECTS_DIR)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener proyectos: {str(e)}")

# 📌 Endpoint para crear un nuevo proyecto
@app.post("/api/new_project")
def create_project(name: str, overwrite: bool = False):
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
async def upload_bathymetry(project_name: str, file: UploadFile = File(...)):
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
        # (Esto debe coincidir con lo que el frontend envía)
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
async def get_bathymetry_data(project_name: str):
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
async def generate_3d_model(project_name: str):
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