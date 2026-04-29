import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import 'bootstrap-icons/font/bootstrap-icons.css';
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import '/public/assets/compiled/css/app.css';
import '/public/assets/compiled/css/app-dark.css';
import '/public/assets/compiled/css/iconly.css';
import './index.css';

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
