import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const ColumnSelector = ({ headers, selectedColumns, setSelectedColumns }) => {
  const handleColumnChange = (event, type) => {
    setSelectedColumns((prev) => ({ ...prev, [type]: event.target.value }));
  };

  return (
    <div style={{ fontFamily: "Roboto", fontSize: "0.7rem" }}>
      <FormControl fullWidth size="small" sx={{ mt: 1, minWidth: 120 }}>
        <InputLabel sx={{ fontSize: "0.75rem" }}>Latitud</InputLabel>
        <Select
          value={selectedColumns.latitude}
          onChange={(e) => handleColumnChange(e, "latitude")}
          label="Latitud"
          sx={{ fontSize: "0.75rem", height: 32 }}
        >
          {headers.map((header, index) => (
            <MenuItem key={index} value={header} sx={{ fontSize: "0.75rem", padding: "4px 8px" }}>
              {header}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small" sx={{ mt: 1, minWidth: 120 }}>
        <InputLabel sx={{ fontSize: "0.75rem" }}>Longitud</InputLabel>
        <Select
          value={selectedColumns.longitude}
          onChange={(e) => handleColumnChange(e, "longitude")}
          label="Longitud"
          sx={{ fontSize: "0.75rem", height: 32 }}
        >
          {headers.map((header, index) => (
            <MenuItem key={index} value={header} sx={{ fontSize: "0.75rem", padding: "4px 8px" }}>
              {header}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small" sx={{ mt: 1, minWidth: 120 }}>
        <InputLabel sx={{ fontSize: "0.75rem" }}>Profundidad</InputLabel>
        <Select
          value={selectedColumns.depth}
          onChange={(e) => handleColumnChange(e, "depth")}
          label="Profundidad"
          sx={{ fontSize: "0.75rem", height: 32 }}
        >
          {headers.map((header, index) => (
            <MenuItem key={index} value={header} sx={{ fontSize: "0.75rem", padding: "4px 8px" }}>
              {header}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default ColumnSelector;
