import axios from "axios";
import React, { useState } from "react";
import PropTypes from 'prop-types';

const Auth = (state, token, cd, setState, setToken, setCD) => {

    const errorStyles = {color: 'red', fontStyle: 'italic'}

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const toggleRegister = () => {
        setState({...state, isRegister: !state.isRegister})
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
        .then(response=>{setToken(response.data.token); localStorage.setItem(['token'], response.data.token)})
        .catch(error=>setCD({...cd, errorMessage: error.response.data.message}));
    };

    const handleLoginOrRegister = (event) => {
        event.preventDefault();
        setCD({...cd, errorMessage: null});
        getToken(state.isRegister);
        setState({...state, isRegister: false});
    };

    const Login = () => {return(<div className="d-flex flex-column h-100">

        {/* header + create new buttom */}
        <div className="row d-flex justify-content-between mt-3">
            <div className="col-4"></div>
            <h3 className="col-4">Play Civilization</h3>
            <div className="col-4 d-flex justify-content-end">
                <button className="btn btn-light" onClick={toggleRegister}>Create New User?</button>
            </div>
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
            <div><button className="mx-auto btn  border btn-primary"  type="submit">Login!</button></div>
        </form>
    </div>)};

    const Register = () => {
        return (<>
        <div className="row d-flex justify-content-between mt-3">
            <div className="col-4"></div>
            <h3 className="col-4">Play Civilization</h3>
            <div className="col-4 d-flex justify-content-end">
                <button className="btn btn-light" onClick={toggleRegister}>Back to log in</button>
            </div>
        </div>
        <h5 className="mb-3">{cd.errorMessage? <span style={errorStyles}>{capitalize(cd.errorMessage)}</span>: null}{cd.errorMessage? ' - please try again.': 'New user'}</h5>
        <form onSubmit={handleLoginOrRegister}>
            <div className="row my-3">
                <div className="form-floating col-lg-6">
                    <input key="newUsername" type="text" className="form-control" id="newUsername" placeholder="text" value={cd.username} onChange={handleUsernameChange} required/>
                    <label htmlFor="newUsername">Username</label>
                </div>
            </div>
            <div className="row d-flex justify-content-between mb-3">
                <div className="form-floating col-lg-6">
                    <input key="newPassword" type="password" className="form-control" id="newPassword" placeholder="Password" value={cd.password} onChange={handlePasswordChange} required/>
                    <label htmlFor="newPassword">Password</label>
                </div>
                <div className="form-floating col-lg-6 mt-3 mt-lg-0">
                    <input key="newPasswordRepeat" type="password" className="form-control" id="newPasswordRepeat" placeholder="Password" value={cd.passwordRepeat} onChange={handlePasswordRepeatChange} required/>
                    <label htmlFor="newPasswordRepeat">Repeat Password</label>
                </div>
            </div>
            <button className="btn btn-primary border">Create!</button>
        </form>
    </>)};

    return (<>
        {!state.isRegister? Login(): Register()}
    </>)
};

export default Auth;
