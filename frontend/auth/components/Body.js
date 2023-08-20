import React, { useEffect } from "react";
import TextInput from "../../components/TextInput";
import Button from "../../components/Button";
import axios from "axios";

function Body(props) {

    const state = props.state
    const setState = props.setState
    const UsernameSetter = (event) =>setState(state=>{return{...state, username: event.target.value}});
    const passwordSetter = (event) =>setState(state=>{return{...state, password: event.target.value}});
    const passwordRepeatSetter = (event) =>setState(state=>{return{...state, passwordRepeat: event.target.value}});
    const handleSubmit = () => {
        const data = {
            username: state.username,
            password: state.password,
            passwordRepeat: state.passwordRepeat,
            register: state.register,
        }
        axios.post('/api/public/token', data)
        .then(response=>{localStorage.setItem('token', response.data.token); setState(state=>{return {...state, token: response.data.token}})})
        .catch()
    }
    
    return (
    <div className="row p-0 m-0" key="body">
        <TextInput className="pe-0 pe-lg-1 col-lg-6" fieldName='username' value={state.username} setter={UsernameSetter}/>
        {state.register? <div className="col-lg-6"></div>:null}
        <TextInput className={state.register?'pe-0 pe-lg-1':'ps-0 ps-lg-1 col-lg-6'} fieldName='password' value={state.password} setter={passwordSetter}/>
        {state.register? <TextInput className='ps-0 ps-lg-1 col-lg-6' fieldName='repeat password' value={state.passwordRepeat} setter={passwordRepeatSetter}/>: null}
        <div className="mx-auto pb-2 col-4"><Button className='bgSecondary p-1' text={state.register? 'Create': 'Login'} handle={handleSubmit}/></div>
    </div>
)};

export default Body;
