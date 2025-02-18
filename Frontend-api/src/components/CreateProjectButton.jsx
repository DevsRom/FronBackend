import * as React from "react";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import Stack from "@mui/material/Stack";
import NewProject from "./NewProject";

function CreateProjectButton() {
  return (
    <Stack direction="row" spacing={2}>
      <NewProject />
    </Stack>
  );
}

export default CreateProjectButton;
