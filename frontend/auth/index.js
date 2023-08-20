import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Auth from "./Auth";
import 'bootstrap';

const root = createRoot(document.getElementById('root'));
root.render(<StrictMode><Auth/></StrictMode>);
