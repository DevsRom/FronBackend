import { useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Button, Typography } from "@mui/material";

const FileUploader = ({ onFileSelect }) => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div style={{ fontFamily: "Roboto", fontSize: "0.875rem" }}>
      <input
        type="file"
        accept=".csv"
        id="file-input"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <label htmlFor="file-input">
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUploadIcon />}
          size="small"
          style={{ fontFamily: "Roboto", fontSize: "0.875rem" }}
        >
          {fileName || "Seleccionar Archivo CSV"}
        </Button>
      </label>
      {fileName && (
        <Typography variant="body2" style={{ fontFamily: "Roboto", fontSize: "0.875rem" }}>
          📂 {fileName}
        </Typography>
      )}
    </div>
  );
};

export default FileUploader;