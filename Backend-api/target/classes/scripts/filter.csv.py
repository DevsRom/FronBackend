import pandas as pd
import sys

def filter_csv(input_csv, output_csv):
    try:
        # Detectar separador (',' o ';')
        with open(input_csv, 'r', encoding='utf-8') as f:
            first_line = f.readline()
            separator = ',' if ',' in first_line else ';'

        # Leer CSV con el separador detectado
        df = pd.read_csv(input_csv, delimiter=separator, encoding="utf-8")

        # Normalizar nombres de columnas a minúsculas
        df.columns = df.columns.str.lower().str.strip()

        # Verificar si existen las columnas necesarias
        required_columns = ['latitude', 'longitude', 'depth']
        if not all(col in df.columns for col in required_columns):
            print("❌ Error: El archivo no contiene todas las columnas necesarias.")
            return

        # Filtrar las columnas
        df_filtered = df[required_columns]

        # Guardar el CSV filtrado
        df_filtered.to_csv(output_csv, index=False, sep=separator, encoding="utf-8")
        print(f"✅ CSV filtrado correctamente y guardado en {output_csv}")

    except Exception as e:
        print(f"❌ Error procesando CSV: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("❌ Uso incorrecto: python filter_csv.py <input_csv> <output_csv>")
    else:
        filter_csv(sys.argv[1], sys.argv[2])
