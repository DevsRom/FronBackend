import pandas as pd
import os
import sys

if len(sys.argv) < 2:
    print("❌ Error: Debes proporcionar el archivo CSV como argumento.")
    sys.exit(1)

input_file_path = sys.argv[1]
output_file_path = os.path.join(os.path.dirname(input_file_path), "normalized_" + os.path.basename(input_file_path))

def normalize_lat_lon(value):
    try:
        value = float(value)
        if abs(value) > 180:
            value = value / 1e7  # Escala si es necesario
        return value
    except ValueError:
        return None

try:
    df = pd.read_csv(input_file_path, delimiter=",", encoding="utf-8")

    df["Latitude"] = df["Latitude"].apply(normalize_lat_lon)
    df["Longitude"] = df["Longitude"].apply(normalize_lat_lon)

    df = df.dropna(subset=["Latitude", "Longitude", "ECHO:Depth"])

    df.rename(columns={"ECHO:Depth": "Depth"}, inplace=True)

    df.to_csv(output_file_path, index=False, sep=";")
    print(f"✅ Archivo normalizado guardado en: {output_file_path}")

except Exception as e:
    print(f"❌ Error procesando el CSV: {e}")
    sys.exit(1)
