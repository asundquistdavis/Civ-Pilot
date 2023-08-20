import React from "react";

const Button = (props) => {
    
    const text = props.text;
    const handle = props.handle;
    const className = props.className;

    return (
        <button
        className={className + " " + "btn p-0"}
        onClick={handle}
        >{text}
        </button>
    )
};

export default Button;
