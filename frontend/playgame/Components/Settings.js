import React from "react";
import Modal from "../../components/Modal";
import Header from "../../components/Header";

const Settings = (props) => {

    const { buttonL, text } = props;

    return (
        <Modal>
            <Header buttonL={buttonL} text={text}/>
            
        </Modal>
    )
}

export default Settings;
