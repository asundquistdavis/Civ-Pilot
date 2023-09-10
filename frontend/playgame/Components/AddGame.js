import axios from "axios";
import React from "react";

const AddGame = (props) => {

    const { state, setState } = props;

    const setAddHostUsername = (event) => {setState(state=>{return {...state, addHostUsername: event.target.value}});};

    const setHostGame = () => {setState(state=>{return {...state, hostGame: !state.hostGame}})}

    const addGame = () => {
        if (state.hostGame) {
            const data = {
                token: state.token
            };
            axios.post('/api/public/game/host', data)
            .then(response=>setState(state=>{return {...state, player: response.data.player}}))
        }
        else {
            const data = {
                token: state.token,
                gameId: state.addGameId
            }
            axios.post('/api/public/game/add', data)
            .then(response=>setState(state=>{return {...state, player: response.data.player}}))
        }
    }

    const joinButton = <button className={'btn bgSecondary border-dark w-15 w-sm-10 ' + (state.addGameId? 'cSecondary': null)} disabled={!state.addGameId} onClick={addGame}>Join</button>

    const hostButton = <button className="btn bgSecondary border-dark w-15 w-sm-10 cSecondary" onClick={addGame}>Host</button>

    return (
        <div className="input-group input-group-sm mb-3 ">
            <span className="input-group-text" id="basic-addon1">Add Game:</span>
            <input type="text" className="form-control" onChange={setAddHostUsername} disabled={state.hostGame} value={state.hostGame? state.player.username: state.addHostUsername}/>
            <span className="input-group-text" id="basic-addon1">Host?</span>
            <div className="input-group-text">
                <input className="form-check-input mt-0" type="checkbox" checked={state.hostGame} onChange={setHostGame}/>
            </div>
            {state.hostGame? hostButton: joinButton}
        </div>
    );

};

export default AddGame
