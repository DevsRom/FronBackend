import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box sx={{ bgcolor: "background.paper", p: 6 }} component="footer">
      <Typography variant="h6" align="center" gutterBottom>
        My App
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" component="p">
        © 2023 My App. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;