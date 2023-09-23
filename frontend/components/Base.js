import React from "react";
import '../components/base.scss';

const Base = (props) => {

    const {children, footer} = props;

    return (
        <div className="container-fluid p-0 m-0 bgGlobal">
            <div className="col flex-column d-flex vh-100">
                <div className="row p-0 m-0">
                    <div className="col-12 col-md-8 mx-auto overflow-x-hidden
                                    vh-100 vh-md-auto overflow-y-auto
                                    overflow-md-none mt-md-5 
                                    p-0 px-2 border-0 border-md-secondary
                                    bgPrimary
                                    flex-column d-flex d-md-block">
                        <div className="row">{children}</div>
                        <div className="row mt-auto d-md-none">{footer}</div>
                    </div>
                </div>
                <div className="mt-auto d-none d-md-block">{footer}</div>
            </div>
        </div>
    );
};

export default Base;
