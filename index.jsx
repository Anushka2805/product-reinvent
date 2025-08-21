// src/index.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./src/App"; // This must match the file name and location
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
