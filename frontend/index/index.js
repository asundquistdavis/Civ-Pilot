import React, { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import 'bootstrap';
import Base from '../components/Base';
import axios from "axios";

const Index = () => {

    const [onLoad, setOnLoad] = useState(true)
    const [token, setToken] = useState(null);

    useEffect(()=>{
        setOnLoad(false);
        if (onLoad) {
            const localToken = localStorage.getItem('token')
            if (localToken != null) {setToken(localToken)}
            else {
                console.log('no token');
                window.location.replace('/page/auth');
            }
        };
    }, [onload]);

    useEffect(()=>{
        token? window.location.replace('/page/play'): null
    }, [token]);

    return (
        <Base>
            Loading...
        </Base>
    );};

const root = createRoot(document.getElementById('root'));
root.render(<StrictMode><Index/></StrictMode>);
