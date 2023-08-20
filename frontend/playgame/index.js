import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import PlayGame from "./PlayGame";
import 'bootstrap';

const root = createRoot(document.getElementById('root'));
root.render(<StrictMode><PlayGame/></StrictMode>); 
