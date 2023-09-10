import React, { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import 'bootstrap';
import Base from '../components/Base';

const Index = () => {

    const [state, setState] = useState({
        onLoad: true,
        token: null,
        player: null,
    });

    useEffect(()=>{
        if (state.onLoad) {
            const localToken = localStorage.getItem('token')
            if (localToken != null) {setState(state=>{return {...state, token: localToken}})}
            else {
                window.location.replace('/page/auth');
            }
        };
        setState(state=>{return {...state, onLoad: false}});
    }, [onload]);

    useEffect(()=>{
        state.token? window.location.replace('/page/play'): null;
    }, [state.token]);

    return (
        <Base>
            Loading...
        </Base>
    );};

const root = createRoot(document.getElementById('root'));
root.render(<StrictMode><Index/></StrictMode>);
