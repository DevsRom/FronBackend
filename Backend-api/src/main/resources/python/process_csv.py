import pandas as pd
import sys
import os

def process_csv(input_file, output_file):
    try:
        # Verificar si el archivo existe
        if not os.path.exists(input_file):
            print(f"❌ Error: El archivo {input_file} no existe.")
            sys.exit(1)

        # Detectar delimitador
        with open(input_file, 'r', encoding='utf-8') as f:
            first_line = f.readline()
            delimiter = ";" if ";" in first_line else ","
        
        # Leer CSV
        df = pd.read_csv(input_file, delimiter=delimiter)

        # Normalizar nombres de columnas
        df.columns = df.columns.str.strip().str.lower()

        # Buscar nombres correctos
        latitude_col = next((col for col in df.columns if "latitude" in col.lower()), None)
        longitude_col = next((col for col in df.columns if "longitude" in col.lower()), None)
        depth_col = next((col for col in df.columns if "depth" in col.lower()), None)

        if not all([latitude_col, longitude_col, depth_col]):
            raise ValueError("❌ No se encontraron las columnas necesarias (latitude, longitude, depth)")

        # Filtrar y guardar
        df_filtered = df[[latitude_col, longitude_col, depth_col]]
        df_filtered.to_csv(output_file, index=False, sep=";")

        print(f"✅ Archivo procesado correctamente: {output_file}")

    except Exception as e:
        print(f"❌ Error procesando CSV: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python process_csv.py <archivo_entrada> <archivo_salida>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    process_csv(input_file, output_file)
