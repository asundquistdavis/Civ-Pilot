import React from "react";
import axios from "axios";
import { object } from "prop-types";

const capitalize = (str) => str? str.charAt(0).toUpperCase() + str.slice(1): null;
const title = (str) => str.split(' ').map(sub=>capitalize(sub)).join(' ')

const PlayGame = (state, token, cd, player, game, civilizations, advCards, setState, setToken, setCD, setPlayer, setGame, setCivilizations, setAdvCards) => {

    console.log(advCards);

    const colors = {'orange': '#ee8222',
        'yellow': '#f7cb0d',
        'red': '#ec232e',
        'blue': '#0282CF',
        'green': '#40b24c',}

    const isServerHost = game.hostId === player.id

    const handleLogout = () => {
        localStorage.clear();
        setToken(null);
        setPlayer(null);
        setCD({...cd, setErrorMessage: null});
    };

    const handleLeaveOrDelete = (event) => {
        event.preventDefault()
        axios.post('/api/game', {playerId: player.id, token: token, type: isServerHost? 'delete': 'leave'})
        .then(response=>setGame(response.data.game));
    };

    const renderCivCard = (card, key) => {
            
        const pcolor = colors[card.pgroup];
        const scolor = card.sgroup? colors[card.sgroup]: pcolor;
        const points = Math.floor(card.price/100) + 1;
        const cardStyle = {backgroundImage: `linear-gradient(to right, ${pcolor}, ${scolor})`};
        const creditsUP = Object.keys(card.credits).map(group=>[group, card.credits[group]]).filter(credit=>credit[1]);
       
        return(
        <div className="col-6 col-sm-4 col-xl-3" key={key}>
            <div className="my-1 mx-auto border p-1 border-dark rounded shadows bg-white" style={{height: '250px'}}>
                <div className="">
                    <h6 className="rounded border p-1" style={cardStyle}>{title(card.name)}</h6>
                </div>
                <div className="flex-row d-flex justify-content-between text-center mb-1">
                    <div className="col-2 price-circle border border-dark py-1 ms-1">{card.price}</div>
                    <div className="col-2 points-square border border-dark py-1 me-1">{points}</div>
                </div>
                <div className="flex-row d-flex justify-content-start text-center ms-1">
                {creditsUP.map((credit, key)=><div className="col-2 py-1 me-1 border border-dark" key={key} style={{backgroundColor: colors[credit[0]], aspectRatio:1, borderRadius: '50%'}}>{credit[1]}</div>)}
                </div>
            </div>
        </div>)
    };

    const Scoreboard = () => {

        console.log([...game.players])

        const sortedPlayers = (
            state.sortMode==='player'? [...game.players].sort((player, otherPlayer)=>{
                const username = player.username.toUpperCase(); 
                const otherUsername = otherPlayer.username.toUpperCase();
                return (username > otherUsername)? (state.sortAcs? -1: 1): (otherUsername > username)? (state.sortAcs? 1: -1): 0}):
            state.sortMode==='civilization'? [...game.players].sort((player, otherPlayer)=>{
                const civName = player.civ.toUpperCase(); 
                const otherCivame = otherPlayer.civ.toUpperCase();
                return (civName > otherCivame)? (state.sortAcs? -1: 1): (otherCivame > civName)? (state.sortAcs? 1: -1): 0}):
            state.sortMode==='score'? [...game.players].sort((player, otherPlayer)=>{state.sortAcs? player.score-otherPlayer.score: otherPlayer.score-player.score}):
            game.players);

        const handlePlayerSelect = (playerRow) => {setState({...state, viewingPlayer: playerRow, viewingMode: 'card'})};

        const renderPlayerRow = (playerRow, key) => {

            const playerIsHost = playerRow.isHost;
            const playerHasSelection = playerRow.advCardsSelection.length>0;
            const symbols = [playerIsHost? '\u2B50': null, playerHasSelection? '\u2705': null];
            const civStyle = {backgroundColor: playerRow.color}
    
            return (
               <tr key={key}>
                    <td>{symbols.join(' ')}</td>
                    <td><button className="btn" onClick={()=>handlePlayerSelect(playerRow)}>{capitalize(playerRow.username)}</button></td>
                    <td style={civStyle}>{capitalize(playerRow.civ)}</td>
                    <td>{playerRow.score}</td>
                </tr>
            );
        };

        const handleSortFor = (targetMode) => {
            const mode = state.sortMode;
            const acsending = state.sortAcs
            if (targetMode===mode) {setState({...state, sortMode: mode, sortAcs: !acsending})}
            else {setState({...state, sortMode: targetMode, sortAcs: false})};
        };

        const renderArrowDown = () => {return(<svg width="12" height="12" fill="currentColor" className="bi bi-caret-down-square" viewBox="0 0 16 16">
            <path d="M3.626 6.832A.5.5 0 0 1 4 6h8a.5.5 0 0 1 .374.832l-4 4.5a.5.5 0 0 1-.748 0l-4-4.5z"/>
            <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2z"/>
        </svg>)};

        const renderArrowDownFill = () => {return (<svg width="12" height="12" fill="currentColor" className="bi bi-caret-down-square-fill" viewBox="0 0 16 16">
            <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm4 4a.5.5 0 0 0-.374.832l4 4.5a.5.5 0 0 0 .748 0l4-4.5A.5.5 0 0 0 12 6H4z"/>
        </svg>)};
        
        const renderArrowUpFill = () => {return(<svg width="12" height="12" fill="currentColor" className="bi bi-caret-up-square-fill" viewBox="0 0 16 16">
            <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm4 9h8a.5.5 0 0 0 .374-.832l-4-4.5a.5.5 0 0 0-.748 0l-4 4.5A.5.5 0 0 0 4 11z"/>
        </svg>)};

        const renderSortFor = (mode) => {return (<button className="btn btn-sm" onClick={()=>handleSortFor(mode)}>
                {state.sortMode===mode? (state.sortAcs? renderArrowUpFill(): renderArrowDownFill()): renderArrowDown()}
            </button>)};

        return (
            <div>
                <h5>{capitalize(game.host)}'s Game</h5>
                <div className="bg-light">
                    <table className="table mt-3">
                        <thead><tr>
                            <th scope="col"></th><th scope="col">Player{renderSortFor('player')}</th>
                            <th scope="col">Civilization{renderSortFor('civilization')}</th>
                            <th scope="col">Score{renderSortFor('score')}</th>
                        </tr></thead>
                        <tbody>{sortedPlayers.map(renderPlayerRow)}</tbody>
                    </table>
                </div>
            </div>);
        };

    const Browser = () => {

        const playerVeiwing = state.viewingPlayer
        const advCardsViewingSorted = (
            state.sortMode==='name'? [...cd.advCardsViewing].sort((card, otherCard)=>{
                const name = card.name.toUpperCase(); 
                const otherName = otherCard.name.toUpperCase();
                return (name > otherName)? (state.sortAcs? -1: 1): (otherName > name)? (state.sortAcs? 1: -1): 0}):
            state.sortMode==='color'? [...cd.advCardsViewing].sort((card, otherCard)=>{
                const color = card.pgroup.toUpperCase();
                const otherColor = otherCard.pgroup.toUpperCase();
                return (color > otherColor)? (state.sortAcs? -1: 1): (color < otherColor)? (state.sortAcs? 1: -1): 0}):
            cd.advCardsViewing
        )

        const searchCardFor = (card, query, key) => {
            return card[key].includes(query);
        };

        const handleQueryChange = (event) => {
            event.preventDefault();
            const query = event.target.value;
            const key = 'name';
            setCD({...state, advCardsViewing: (!query? advCards: advCards.filter(card=>searchCardFor(card, query, key)))});
        };

        const changeSortMode = (mode) => {
            setState({...state, sortMode: mode})
        };

        return (<div>
            <h5>Browsing Cards</h5>
            <div></div>
            <div className="row form-floating mx-2">
                <div className="col-6 col-md-3">
                    <input className="form-control" type="text" onChange={handleQueryChange}></input>
                </div>
                <div className="form-check form-switch text-start col-2">
                    <input className="form-check-input" type="checkbox" role="switch" checked={state.isFilterOn} onChange={()=>setToggleFilter(!state.isFilterOn)}/>
                    <label className="form-check-label">Title Only</label>
                </div>
                <div className="col-4">
                    <div class="btn-group" role="group" aria-label="Basic radio toggle button group">
                        <input type="radio" class="btn-check" name="btnradio" id="btnradio1" autocomplete="off" checked={state.sortMode==='color'} onClick={()=>changeSortMode('color')}/>
                        <label class="btn btn-outline-primary" for="btnradio1">Color</label>

                        <input type="radio" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off" checked={state.sortMode==='name'} onClick={()=>changeSortMode('name')}/>
                        <label class="btn btn-outline-primary" for="btnradio2">Name</label>

                        <input type="radio" class="btn-check" name="btnradio" id="btnradio3" autocomplete="off" checked={state.sortMode==='price'} onClick={()=>changeSortMode('price')}/>
                        <label class="btn btn-outline-primary" for="btnradio3">Price</label>
                    </div>
                {/* <div class="btn-group" role="group" aria-label="Basic outlined example">
                    <button type="radio" class="btn btn-outline-primary"  >Color</button>
                    <button type="radio" class="btn btn-outline-primary" >Name</button>
                    <button type="radio" class="btn btn-outline-primary"  >Price</button>
                
                <button className="btn btn-small">Color</button></div> */}
                </div>
            </div>
            <div className="row">{advCardsViewingSorted.map(renderCivCard)}</div>
        </div>)

    };

    const Player = () => {


        const playerViewing= state.viewingPlayer;
        const playerHasCards = playerViewing.advCards.length>0;
        const playersAdvCards = playerViewing.advCards.sort((card, otherCard)=>{card.name.toUpperCase()>otherCard.name.toUpperCase()? 1: -1});
        const canMakeSelection = playerViewing.id===player.id || isServerHost;

        const handlePurchaseSelect = (event) => {
            event.preventDefault();
            setState({...state, viewingMode: 'browser', sortMode:'name'});
            setCD({...cd, advCardsViewing: advCards})
        }; 

        return (<div>
            <h5>Viewing {capitalize(playerViewing.username)}'s Info</h5>
            <div className="row">
                <div className="col-2"><button className="btn btn-primary" onClick={handlePurchaseSelect} disabled={!canMakeSelection}>Purchase Cards</button></div>
            </div>
            <div className="row">{playerHasCards? playerViewing.advCards.map(renderCivCard): <div>Player has no cards</div>}</div>
        </div>)
    };

    return (<div className="d-flex flex-column">
        <div className="row d-flex justify-content-between mt-3 align-items-stretch">
            <div className="col-3 d-flex flex-no-wrap justify-conent-start">
                {/* leave game or back button */}
                <button className="btn btn-dark btn-sm me-1" onClick={state.viewwingPlayer? ()=>setViewing([null, 'board']): handleLeaveOrDelete}>{state.viewingMode? 'Scoreboard': isServerHost? 'End Game': 'Leave Game'}</button>
            </div>
            {/* title */}
            <h3 className="col-6">Play Civilization</h3>
            {/* player username and log out */}
            <div className="col-3 d-flex flex-no-wrap justify-content-end">
                <div>{capitalize(player.username)}<button className="btn btn-sm btn-danger ms-md-1 h-100" onClick={handleLogout}>Log out</button></div>
            </div>
        </div>
        {/* game name */}
        {state.viewingMode==='card'? 
            Player()
        :state.viewingMode==='browser'?
            Browser()
        :Scoreboard()}
    </div>);
};

export default PlayGame;
