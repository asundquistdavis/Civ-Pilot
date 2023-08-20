import React from "react";
import Button from "../../components/Button";
import TextInput from "../../components/TextInput";
import Toggle from "../../components/Toggle";
import axios from "axios";

const ManageGames = (props) => {

    const { state, setState } = props

    const setAddHostUsername = (event) => {
        setState(state=>{return {...state, addHostUsername: event.target.value}});
    };

    const addGame = () => {
        const data = {
            token: state.token,
            gameId: state.addGameId,
        };
        axios.post('/api/public/game/add', data)
        .then(response=> console.log(response))//setState(state=>{return {...state, player: response.data.player}}));
    };

    const hostGame = () => {
        const data = {
            token: state.token
        };
        axios.post('/api/public/game/host', data)
        .then(response=>setState(state=>{return {...state, player: response.data.player}}));
    }

    const ListGames = state.player?.games?.map((game, key)=>(
        <div key={key} className="row">
            <div className="col-4">{game.turnNumber}</div>
            <div className="col-4">{game.gameId}</div>
            <div className="col-4">{game.host}</div>
        </div>
    ));

    const AddGame = 
        <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">Add Game</span>
            <input type="text" className="form-control" aria-label="Text input with checkbox" placeholder="host username" onChange={setAddHostUsername} value={state.addHostUsername}/>
            <button className="btn bgSecondary text-dark border-dark" type="button" id="button-addon2" onClick={hostGame}>Host</button>
            <button className="btn bgSecondary text-dark border-dark" type="button" id="button-addon2" onClick={addGame}>Join</button>
        </div>

    return (
        <div className="col p-0 m-0">
            {ListGames}
            {AddGame}
        </div>
    );
};

export default ManageGames;
