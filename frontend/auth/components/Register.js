import React from "react";
import Header from "../../components/Header";
import BackToLoginButton from "./BackToLoginButton";

function Register() {

    const buttonL = BackToLoginButton.bind(this);

    return (
        <div>
            <Header buttonL={buttonL()}></Header>
        </div>
    )
};

export default Register;
