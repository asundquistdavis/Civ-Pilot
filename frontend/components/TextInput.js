import React from "react";
import { capatalize, title } from "../utilities";

const TextInput = (props) => {

    const className = props.className;
    const fieldName = props.fieldName;
    const value = props.value;
    const setter = props.setter;

    return (        
        <div className={'pb-2 form-floating p-0 m-0' + ' ' + className}>
            <input key={fieldName} type="text" className="form-control border-dark" id={fieldName} placeholder={value} value={value} required onChange={setter}/>
            <label htmlFor="newUsername">{title(fieldName)}</label>
        </div>
    );
}

export default TextInput;