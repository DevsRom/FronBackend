import React from "react";
import { Box, Container } from "@mui/material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Container component="main" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
      <Footer />
    </Box>
  );
};

export default MainLayout;