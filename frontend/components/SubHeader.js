import React from "react";

const SubHeader = (props) => {

    const { L, text, R, className } = props;

    return (<div className={'row d-flex flex-row align-items-end ' + className}>
        <div className="col text-start mb-1">{L}</div>
        <h5 className="col ms-auto">{text}</h5>
        <div className="col text-end ms-auto mb-1">{R}</div>
    </div>);
};

export default SubHeader;
