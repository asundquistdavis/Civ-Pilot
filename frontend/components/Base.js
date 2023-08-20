import React from "react";
import '../components/base.scss';

const Base = (props) => {

    const children = props.children;

    return (
        <div className="container-fluid p-0 m-0 bgGlobal vh-100">
            <div className="row p-0 m-0">
                <div className="col-12 col-md-8 mx-auto overflow-x-hidden
                                vh-100 vh-md-auto overflow-y-auto
                                overflow-md-none mt-md-5 
                                p-0 px-2 border-0 border-md-secondary
                                bgPrimary text-center ">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Base;
