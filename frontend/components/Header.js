import React from "react";

const Header = (props) => {

    const { buttonL, buttonR, text } = props;

    return (<div className="row d-flex flex-row pt-2" key="header">
        <div className="col text-start">{buttonL}</div>
        <h3 className="col ms-auto">{text}</h3>
        <div className="col ms-auto text-end">{buttonR}</div>
    </div>)
};

export default Header;
