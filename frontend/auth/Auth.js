import React, { useState, useEffect } from "react";
import Base from '../components/Base'
import Header from "../components/Header";
import Body from "./components/Body";
import Button from "../components/Button";

const Auth = () => {

    const [state, setState] = useState({
        register: false,
        username: "",
        password: "",
        passwordRepeat: "",
        token: null
    });
    const buttonL = () => state.register? <Button className='bgSecondary p-1' text='Login?' handle={()=>setState(state=>{return{...state, register: false}})}/>:
                                          <Button className='bgSecondary p-1' text='New User?' handle={()=>setState(state=>{return {...state, register:true}})}/>;

   useEffect(()=>{
        if (state.token) {window.location.replace('/')}
    }, [state.token]);

    return (
        <Base>
            <Header buttonL={buttonL()} text="Mega Civilization"/>
            <Body state={state} setState={setState}/>
        </Base>
    );
};

export default Auth;
