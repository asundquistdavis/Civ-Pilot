import React from "react";

const Header = (props) => {

    const { buttonL, buttonR, text, subR, subT } = props;

    return (<>
        <div className="row d-flex flex-row pt-2" key="header">
            <div className="col text-start">{buttonL}</div>
            <div className="col ms-auto">
                <h3 className="text-center m-0 p-0">{text}</h3>
                <h6 className="text-center m-0 p-0">{subT}</h6>
            </div>
            <div className="col ms-auto">
                <div className="text-end">{buttonR}</div>
                <div className="text-end">{subR}</div>
            </div>
        </div>
    </>)
};

export default Header;
