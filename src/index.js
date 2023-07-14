import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import 'bootstrap';
import '/src/styles.css'
import '/src/styles.scss'; 

const root = createRoot(document.getElementById('root'));
root.render(<App/>);
