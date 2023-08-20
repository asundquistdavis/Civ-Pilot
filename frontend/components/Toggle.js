import React from "react";

const Toggle = (props) => {
    
    const { text, checked, disabled, handle, } = props;

    return (<div className="form-check form-switch text-start">
        <input className="form-check-input" type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={handle}/>
        <label className="form-check-label">{text}</label>
    </div>)
};

export default Toggle;
