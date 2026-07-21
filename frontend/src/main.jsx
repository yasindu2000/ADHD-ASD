import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { SensoryProvider } from "./context/SensoryContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <SensoryProvider>
        <App />
      </SensoryProvider>
    </BrowserRouter>
  </StrictMode>,
);
