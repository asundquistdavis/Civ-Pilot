import React from "react";
import '../components/modal.scss'

const Modal = (props) => {

    const children = props.children;

    return (
        <div className='overlay'>
            <div className="col-10 col-sm-8 col-md-6 col-lg-4 mx-auto bg-light mt-4 p-2 text-center border-secondary">
                {children}
            </div>
        </div>
    )
}

export default Modal;
