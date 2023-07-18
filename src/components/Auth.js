import axios from "axios";
import React, { useState } from "react";

const Auth = (state, token, cd, setState, setToken, setCD) => {

    const errorStyles = {color: 'red', fontStyle: 'italic'}

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const toggleRegister = () => {
        setState({...state, isRegister: !state.isRegister})
        setCD({...cd, errorMessage: null})
    };

    const handleUsernameChange = (event) => {
        const username = event.target.value;
        setCD({...cd, username: username});
    };

    const handlePasswordChange = (event) => {
        const password = event.target.value;
        setCD({...cd, password: password});
    }; 

    const handlePasswordRepeatChange = (event) => {
        const passwordRepeat = event.target.value;
        setCD({...cd, passwordRepeat: passwordRepeat});
    };

    const getToken = () => {
        axios.post('/token', {username: cd.username, password: cd.password, passwordRepeat: cd.passwordRepeat, register: state.isRegister})
        .then(response=>{setToken(response.data.token); localStorage.setItem(['token'], response.data.token); setState({...state, isRegister: false});})
        .catch(error=>{
            const message = error.response.data.message;
            // if there is an error set the message
            setCD({...cd, errorMessage: message});
            // specific error handling below i.e. if (message=== 'x') {handleX}
        })
    };

    const handleLoginOrRegister = async (event) => {
        event.preventDefault();
        setCD({...cd, errorMessage: null});
        getToken();
    };

    const Login = () => {return(<div className="d-flex flex-column h-100">

        {/* header + create new buttom */}
        <div className="row d-flex justify-content-between mt-3">
            <div className="col-3 d-flex justify-content-start">
                <button className="btn btn-dark" onClick={toggleRegister}>New User?</button>
            </div>
            <h3 className="col-6">Play Civilization</h3>
            <div className="col-3"></div>
        </div>
        <h5 className="mb-3">{cd.errorMessage? <span style={errorStyles}>{capitalize(cd.errorMessage)}</span>: null}{cd.errorMessage? ' - please try again.': 'Log in'}</h5>
        <form onSubmit={handleLoginOrRegister}>
            <div className="row">
                <div className="form-floating col-lg-6 mb-3">
                    <input type="text" className="form-control" onChange={handleUsernameChange} value={cd.username} required/>
                    <label>Username</label>
                </div>
            </div>
            <div className="row">
                <div className="form-floating col-lg-6 mb-3">
                    <input key="password" type="password" className="form-control" id="password" placeholder="Password" value={cd.password} onChange={handlePasswordChange} required/>
                    <label htmlFor="password">Password</label>
                </div>
            </div>
            <div><button className="mx-auto btn border btn-primary mb-3"  type="submit">Login!</button></div>
        </form>
    </div>)};

    const Register = () => {
        return (<>
        <div className="row d-flex justify-content-between mt-3">
            <div className="col-3 d-flex flex-no-wrap justify-conent-start">
                <button className="btn btn-dark btn-sm me-1 p-2" onClick={toggleRegister}>
                    <svg width="16" height="16" fill="currentColor" className="bi bi-x-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                </button>
            </div>
            <h3 className="col-6">Play Civilization</h3>
            <div className="col-3"></div>
        </div>
        <h5 className="mb-3">{cd.errorMessage? <span style={errorStyles}>{capitalize(cd.errorMessage)}</span>: null}{cd.errorMessage? ' - please try again.': 'New user'}</h5>
        <form onSubmit={handleLoginOrRegister}>
            <div className="row my-3">
                <div className="form-floating col-lg-6">
                    <input key="newUsername" type="text" className="form-control" id="newUsername" placeholder="text" value={cd.username} onChange={handleUsernameChange} required/>
                    <label htmlFor="newUsername">Username</label>
                </div>
            </div>
            <div className="row mb-3">
                <div className="form-floating col-6">
                    <input key="newPassword" type="password" className="form-control" id="newPassword" placeholder="Password" value={cd.password} onChange={handlePasswordChange} required/>
                    <label htmlFor="newPassword">Password</label>
                </div>
                <div className="form-floating col-6">
                    <input key="newPasswordRepeat" type="password" className="form-control" id="newPasswordRepeat" placeholder="Password" value={cd.passwordRepeat} onChange={handlePasswordRepeatChange} required/>
                    <label htmlFor="newPasswordRepeat">Repeat Password</label>
                </div>
            </div>
            <button className="btn btn-primary border mb-3">Create!</button>
        </form>
    </>)};

    return (<>
        {!state.isRegister? Login(): Register()}
    </>)
};

export default Auth;
