import React from "react";
import Modal from "../../components/Modal";
import Header from "../../components/Header";
import { ArrowLeftCircleFill, GearFill, BoxArrowInLeft, XCircleFill } from "react-bootstrap-icons";
import Button from "../../components/Button";
import { capatalize } from "../../utilities";

const Settings = (props) => {

    const { state, setState} = props;

    const handleLogOut = () => {
        window.localStorage.removeItem('token')
        setState(state=>{return {...state, token: null}})
    };

    const leaveGame = () => {
        const data = {

        };
        axios.post('/api/public/game/leave', data)
        .then(response=>setState(state=>{return {...state, player:response.data.player}}))
    };

    const ManageGames = () => {

        const infoRow = (info, key) => {
            return (
                <div key={key} className="row d-flex border p-0 m-0">
                    <div className="col-3">{info.host}</div>
                    <div className="col-3">{info.turnNumber}</div>
                    <div className="col-3 me-auto"><Button handle={leaveGame} text={<XCircleFill fill='red'/>}/></div>
                </div>
            )
        }
        return (<>
            <div className="row">
                <h6 className="col">Manage Games</h6>
            </div>
            <div className="row d-flex p-0 m-0">
                <div className="col-3">Host</div>
                <div className="col-3">status</div>
                <div className="col-6"></div>
            </div>
            {state.player?.games.map(infoRow)}
            </>);
    }

    const settingsButton = <Button handle={()=>setState(state=>{return{...state, viewSettings:!state.viewSettings}})} text={state.viewSettings? <ArrowLeftCircleFill width={25} height={25}/>: <GearFill width={25} height={25}/>}/>

    const logOutButton = <Button handle={handleLogOut} text={<BoxArrowInLeft width={25} height={25}/>}/>

    return (
        <Modal>
            <Header buttonL={settingsButton} text='Settings' buttonR={logOutButton} subR={capatalize(state.player?.username)}/>
            <ManageGames/>
        </Modal>
    )
}

export default Settings;
