import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CoupleDataProvider } from "./context/CoupleDataContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { resetAppStorageOnce } from "./utils/storage.js";
import "./styles/global.css";

resetAppStorageOnce();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <CoupleDataProvider>
            <App />
          </CoupleDataProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
