import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "leaflet/dist/leaflet.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AppProvider } from "./context/AppProvider.jsx";
import "/public/assets/compiled/css/app.css";
import "/public/assets/compiled/css/app-dark.css";
import "/public/assets/compiled/css/iconly.css";
import "./styles/variables.css";
import "./styles/responsive.css";
import "./styles/crud-tables.css";
import "./styles/condominios.css";
import "./styles/login.css";
import "./styles/dark-theme.css";
import "./styles/parking-tailwind.css";


// Red de seguridad: silencia SOLO los AbortError benignos (p. ej. video.play() o
// un fetch interrumpidos al navegar/desmontar). No afecta a ningún otro error real.
window.addEventListener("unhandledrejection", (event) => {
    if (event.reason && event.reason.name === "AbortError") {
        event.preventDefault();
    }
});

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AppProvider>
            <App />
        </AppProvider>
    </React.StrictMode>
);