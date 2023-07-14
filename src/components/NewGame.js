import React from "react";
import axios from "axios";
import { event } from "jquery";

const capitalize = (string) => string? string.charAt(0).toUpperCase() + string.slice(1): string;

const NewGame = (state, token, cd, player, game, civilizations, advCards, setState, setToken, setCD, setPlayer, setGame, setCivilizations, setAdvCards, usernames, setUsernames) => {

    console.log(game)

    const allPlayersHaveCiv = game? Boolean(game.players.filter(player=>player.civ!==null)): false;
    const serverIsHost = game? game.hostId===player.id: false;
    const showingGame = Boolean(game);

    const handleLogout = () => {
        localStorage.clear();
        setToken(null);
        setPlayer(null);
        setCD({...cd, setErrorMessage: null});
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

    const handleJoinOrCreateOrDelete = (event) => {
        console.log(state.isValidGame)
        event.preventDefault()
        if (showingGame) {
            if (serverIsHost) {
                axios.post('/api/game', {playerId: player.id, token: token, type: 'delete'})
                .then(response=>setGame(response.data.game));
            } else {
                axios.post('/api/game', {playerId: player.id, token: token, type: 'leave'})
                .then(response=>setGame(response.data.game));
            };
        } else {
            if (state.isNewHost) {
                axios.post('/api/game', {playerId:player.id, token: token, type: 'create'})
                .then(response=>setGame(response.data.game));
            } else {
                if (state.isValidGame) {
                    const gameId = usernames.filter(user=>user.username===cd.hostName)[0].hostedGameId;
                    console.log(usernames)
                    axios.post('/api/game', {playerId: player.id, gameId: gameId, token: token, type: 'join'})
                    .then(response=>setGame(response.data.game))
                };
            };
        };
    };

    const handleStartGame = (event) => {
        event.preventDefault();
        if (allPlayersHaveCiv && serverIsHost) {
            axios.post('/api/gameaction', {token: token, playerId: player.id, type: 'start'})
            .then(response=>setGame(response.data.game))
        } else {setErrorMessage('All players must select a civilization!')};
    };

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
            <div className="col-4"></div>
            <h3 className="col-4">Play Civilization</h3>
            <div className="col-4 d-flex flex-no-wrap justify-content-end">
                <div>{capitalize(player.username)}<button className="btn btn-light ms-3" onClick={handleLogout}>Log out</button></div>
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
                    <input type="text" placeholder="Disabled input" className="form-control opacity-75" autoComplete="off" onChange={handleHostNameChange} value={game? game.host:(state.isNewHost? player.username: cd.hostName)} required disabled={showingGame || state.isNewHost}/>
                    <label>Host Username</label>
                </div>
                {/* create or join game */}
                <div className="col-2 mb-3"><button className="btn btn-sm btn-light opacity-75" onClick={handleJoinOrCreateOrDelete}>{game? (serverIsHost? 'Delete Game': 'Leave Game'): state.isNewHost? 'Create Game': 'Join Game'}</button></div>
                {/* start game */}
                <div className="col-2 mb-3"><button className="btn btn-primary opacity-75 btn-sm" disabled={!serverIsHost || !allPlayersHaveCiv} onClick={handleStartGame}>Start Game</button></div>
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
