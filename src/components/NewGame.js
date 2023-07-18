import React from "react";
import axios from "axios";

const capitalize = (string) => string? string.charAt(0).toUpperCase() + string.slice(1): string;

const NewGame = (state, token, cd, player, game, civilizations, advCards, setState, setToken, setCD, setPlayer, setGame, setCivilizations, setAdvCards, usernames, setUsernames) => {

    const allPlayersHaveCiv = game? Boolean(game.players.filter(player=>player.civ!==null)): false;
    const serverIsHost = game? game.hostId===player.id: false;
    const showingGame = Boolean(game);

    const handleLogout = () => {
        localStorage.clear();
        setToken(null);
        setPlayer(null);
        setGame(null);
        setCD({...cd, errorMessage: null});
    };

    const handleHostNameChange = async (event) => {
        const name = event.target.value;
        if(!state.isNewHost) {
            setCD({...cd, hostName: name});
        };
    };

    const setcivilization = (event, playerForRow) => {
        event.preventDefault()
        const data = {
            playerId: player.id,
            targetPlayerId: playerForRow.id,
            civilization: event.target.value,
            token, token,
            type: 'civilization'
        };
        axios.post('/api/gameaction', data)
        .then(response=>{
            setGame(response.data.game);
        });
    };

    const handleJoinOrCreate = (event) => {
        event.preventDefault()
            if (state.isNewHost) {
                axios.post('/api/game', {playerId:player.id, token: token, type: 'create'})
                .then(response=>setGame(response.data.game));
            } else {
            if (state.validGameId) {
                axios.post('/api/game', {playerId: player.id, gameId: state.validGameId, token: token, type: 'join'})
                .then(response=>setGame(response.data.game))
            };
        };
    };

    const handleLeaveOrDelete = (event) => {
        event.preventDefault()
        if (showingGame) {
            const hostName = game.host;
            if (serverIsHost) {
                const message = 'Are you sure you want to delete your game?';
                const actionMessage = 'Delete';
                const action = () => axios.post('/api/game', {playerId: player.id, token: token, type: 'delete'})
                .then(response=>{setGame(response.data.game); setState({...state, alert: null});});
                setState({...state, alert: {action, message, actionMessage}});
            } else {
                const message = `Are you sure you want to leave ${capitalize(hostName)}\'s game`;
                const actionMessage = 'Leave';
                const action = () => axios.post('/api/game', {playerId: player.id, token: token, type: 'leave'})
                .then(response=>{setGame(response.data.game);  setState({...state, alert: null});});
                setState({...state, alert: {action, message, actionMessage}});
            };
        };
    }; 

    const handleStartGame = (event) => {
        event.preventDefault();
        if (allPlayersHaveCiv && serverIsHost) {
            axios.post('/api/gameaction', {token: token, playerId: player.id, type: 'start'})
            .then(response=>setGame(response.data.game));
        } else {setErrorMessage('All players must select a civilization!')};
    };

    const gameIsAvailableStyle = {border: 'solid green 3px'};

    const renderTableRow = (playerForRow, key) => {

        const playerHasCiv = (civ) => {return game.players? game.players.filter(player=>player.civ===civ).length>0: false};

        const civsAreAvailable = civilizations? civilizations.map(civ=>{return {...civ, isAvailable: !playerHasCiv(civ.name)}}): null

        const renderCivCell = () => {
            return (<td><select className="form-select text-center" style={{backgroundColor: game? game.players.filter(player=>player.id===playerForRow.id).map(player=>player.color? player.color: null): null}} defaultValue={playerForRow.civ} onChange={(event)=>setcivilization(event, playerForRow)}>
                <option value={null} style={{backgroundColor: 'grey'}}>Select a Civilization</option>
                {civsAreAvailable? civsAreAvailable.map((civilization, key)=>
                    <option key={key} disabled={!civilization.isAvailable} value={civilization.name} style={{backgroundColor: civilization.color}}>{capitalize(civilization.name)}</option>)
                :null}
            </select></td>)};

        return(<tr key={key}>
            <td>{capitalize(playerForRow.username)}</td>
            {(serverIsHost || playerForRow.id===player.id)? renderCivCell(playerForRow): <td style={{backgroundColor: game? game.players.filter(player=>player.id===playerForRow.id).map(player=>player.color? player.color: null): null}}>{playerForRow.civ}</td>}
            {serverIsHost? <td><input className="form-check-input" type="checkbox"/></td>: null}
        </tr>)};

    return (<div className="d-flex flex-column h-100">

        {/* header / username / log out button */}
        <div className="row d-flex justify-content-between mt-3">
            <div className="col-3 d-flex flex-no-wrap justify-conent-start">
                {/* leave/delete game */}
                {showingGame?
                <button className="btn btn-dark btn-sm me-1 p-2" onClick={handleLeaveOrDelete}>
                    <svg width="16" height="16" fill="currentColor" className="bi bi-x-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                </button>:null}
            </div>
            <h3 className="col-6">Play Civilization</h3>
            <div className="col-3 d-flex flex-no-wrap justify-content-end align-items-center">
                {/* player name */}
                <div className="me-1">{capitalize(player.username)}</div>
                {/* log out */}
                <button className="btn btn-sm btn-danger ms-md-1 p-2" onClick={handleLogout}>
                    <svg width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                        <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                    </svg>
                </button>
            </div>
        </div>
        <h5>{showingGame? capitalize(game.host) + '\'s Game': 'Join or create a new game!'}</h5>
        <form>
            {/* toggle host */}
            <div className="form-check form-switch text-start">
                <input className="form-check-input" type="checkbox" role="switch" checked={showingGame? (serverIsHost): state.isNewHost} disabled={Boolean(game)} onChange={()=>setState({...state, isNewHost: !state.isNewHost})}/>
                <label className="form-check-label">Host Game?</label>
            </div>
            {/* input username / join, create or delete game button / start game button */}
            <div className="row d-flex">
                {/* input username */}
                <div className="form-floating col-7 mb-3">
                    <input type="text" placeholder="Disabled input" className="form-control" autoComplete="off" onChange={handleHostNameChange} value={game? game.host:(state.isNewHost? player.username: cd.hostName)} required disabled={showingGame || state.isNewHost}/>
                    <label>Host Username</label>
                </div>
                {/* create or join game / start game */}
                <div className="col-2 mb-3">
                    <button 
                    className="btn btn-sm btn-secondary"
                    style={(state.validGameId && !game) || state.isNewHost? gameIsAvailableStyle:null}
                    disabled={showingGame? !serverIsHost || !allPlayersHaveCiv: false} 
                    onClick={(event)=>showingGame? handleStartGame(event): handleJoinOrCreate(event)}>
                        {showingGame? 'Start Game': state.isNewHost? 'Create Game': 'Join Game'}
                    </button>
                </div>
            </div>
            {/* username / civilization / ready? */}
            {showingGame? 
            <table className="table">
                <thead><tr><th scope="col">Username</th><th scope="col">Civilization</th>{serverIsHost? <th scope="col">Kick</th>: null}</tr></thead>
                <tbody>{game.players.map((player, key)=>renderTableRow(player, key))}</tbody>
            </table>
            :null}   
        </form>
    </div>)
};

export default NewGame;
