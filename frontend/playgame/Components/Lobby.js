import React from "react";
import Button from "../../components/Button";
import { ArrowRightSquareFill, StarFill, XSquareFill } from "react-bootstrap-icons";
import { capatalize } from "../../utilities";
import axios from "axios";
import SubHeader from "../../components/SubHeader";
import PlayerCard from "./PlayerCard";
import HistoryChart from "../../components/HistoryChart";
import BarChart from "../../components/BarChart";

const Lobby = (props) => {

    const { state, setState } = props;

    const host = state.game.host;

    const isHost = state.game.hostId === state.player.id;

    const startGame = () => {
        const data = {
            token: state.token,
            gameId: localStorage.getItem('gameId'),
        }
        axios.post('/api/public/game/start', data)
        .then(response=>setState(state=>{return {...state, game: response.data.game}}));
    };

    const deleteGame = () => {
        const data = {
            token: state.token,
            gameId: localStorage.getItem('gameId'),
        };
        axios.post('/api/public/game/end', data)
        .then(response=>setState(state=>{return {...state, player: response.data.player}}));
    };

    const startButton = <Button handle={startGame} text={<ArrowRightSquareFill width={25} height={25}/>} data-bs-toggle="tooltip" data-bs-placement="top" title="Tooltip on top"/>;

    const deleteButton = <Button handle={deleteGame} text={<XSquareFill width={25} height={25}/>}/>;

    const actionButtons = <div className="d-flex"><div className="">{deleteButton}</div><div className="ms-1">{startButton}</div></div>;
    
    const selectCivilization = (event, gameplayer) => {
        const data = {
            token: state.token,
            infoId: gameplayer.id,
            civilization: event.target.value,
        };
        axios.post('/api/public/civilization/set', data)
        .then(response=>setState(state=>{return {...state, game: response.data.game}}));
    };

    const playerInfo = (gameplayer, key)=>{

        const isPlayer = gameplayer.playerId === state.player.id;

        const playerIsHost = gameplayer.playerId === state.game.hostId;

        const civilizationSelected = state.civilizations?.filter(civilization=>gameplayer.civilization===civilization.civilization)?.[0] || null;

        const civilizationsAvailable = state.civilizations.map(civilization=>{return {...civilization, available: !state.game.players.map(info=>info.civilization).includes(civilization.civilization)}});

        return (<div key={key} className="row d-flex border p-md-0 m-md-0">
            <div className="col-2 m-0 p-0">{playerIsHost? <StarFill color="yellow"/>: null}</div>
            <div className="col-5 m-0 p-0">{capatalize(gameplayer.username)}</div>
            <div className="col-5 m-0 p-0">
                {isPlayer||isHost? 
                <select
                    onChange={event=>selectCivilization(event, gameplayer)}
                    style={{backgroundColor: civilizationSelected?.color||'grey', borderRadius: '0px', width: '100%', textAlign: 'center'}}
                    value={civilizationSelected?.civilization||'select'}>
                    {civilizationSelected? null: <option value='select'>Select</option>}
                    {civilizationsAvailable?.map(civilization=><option
                        key={civilization.civilization} 
                        disabled={!civilization.available}
                        value={civilization.civilization}
                        style={{backgroundColor: civilization.color}}>
                            {capatalize(civilization.civilization)}
                        </option>)}
                </select>:
                <div style={{backgroundColor: civilizationSelected?.color||'grey'}}>{capatalize(civilizationSelected?.civilization||'None')}</div>}
            </div>
        </div>);
    };
    
    const playerInfos = 
        <>
            <div className="row d-flex border p-md-0 m-md-0">
                <div className="col-2"></div>
                <h5 className="col-5">Player</h5>
                <h5 className="col-5">Civilization</h5>
            </div>
            {state.game.players?.map(playerInfo)}
            <div className="row mb-2"></div>
        </>

    return (<div>
        <SubHeader L={actionButtons} text={capatalize(host)} R='Pre-Game Lobby'/>
        {playerInfos}
    </div>)
};

export default Lobby;
