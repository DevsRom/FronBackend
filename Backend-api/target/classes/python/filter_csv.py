import pandas as pd
import sys
import os

if len(sys.argv) < 2:
    print("❌ Error: Debes proporcionar el archivo CSV como argumento.")
    sys.exit(1)

input_file_path = sys.argv[1]
output_file_path = os.path.join(os.path.dirname(input_file_path), "filtered_" + os.path.basename(input_file_path))

try:
    # Verificar si el archivo existe
    if not os.path.exists(input_file_path):
        print(f"❌ Error: El archivo {input_file_path} no existe.")
        sys.exit(1)

    # Cargar CSV
    data = pd.read_csv(input_file_path)

    # Verificar columnas necesarias
    required_columns = ['Latitude', 'Longitude', 'ECHO:Depth']
    missing_columns = [col for col in required_columns if col not in data.columns]

    if missing_columns:
        print(f"❌ Error: Faltan las siguientes columnas en el CSV: {missing_columns}")
        sys.exit(1)

    # Filtrar columnas
    filtered_data = data[required_columns].copy()
    filtered_data.rename(columns={'Latitude': 'latitude', 'Longitude': 'longitude', 'ECHO:Depth': 'depth'}, inplace=True)

    # Guardar archivo
    filtered_data.to_csv(output_file_path, index=False, sep=';')

    print(f"✅ Archivo filtrado guardado en: {output_file_path}")

except Exception as e:
    print(f"❌ Error procesando el archivo CSV: {e}")
    sys.exit(1)
