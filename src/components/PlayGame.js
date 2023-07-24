import React from "react";
import axios from "axios";
import History from "./History";
import Info from "./Info";
import { CheckSquare, PlusSquare, StopBtn, BarChartLine, SkipEndBtn, XCircle, BoxArrowRight, Backspace, InfoSquare } from "react-bootstrap-icons";

const capitalize = (str) => str? str.charAt(0).toUpperCase() + str.slice(1): str;
const title = (str) => str.split(' ').map(capitalize).join(' ')
const sentance = (str) => str?.split('. ')?.map(capitalize).join('. ') || capitalize(str);

const PlayGame = (state, token, cd, player, game, civilizations, advCards, setState, setToken, setCD, setPlayer, setGame, setCivilizations, setAdvCards, history, setHistory) => {

    const colors = {'orange': '#ee8222',
        'yellow': '#f7cb0d',
        'red': '#ec232e',
        'blue': '#0282CF',
        'green': '#40b24c',}

    const isServerHost = game.hostId === player.id;

    const handleLogout = () => {
        localStorage.clear();
        setToken(null);
        setPlayer(null);
        setGame(null);
        setCD({...cd, setErrorMessage: null});
        setState({
            isRegister: false,
            isNewHost: false,
            isValidGame: false,
            viewingPlayer: null,
            viewingMode: 'board',
            sortMode: 'player',
            sortAcs: false,
            filterColor: {green: false, blue: false, orange: false, yellow: false, red: false},
            viewingCard: null,
            alert: null,
            query: '',
        });
    };

    const handleLeaveOrDelete = (event) => {
        const hostName = game.host;
        event.preventDefault()
        if (isServerHost) {
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

    const handleCardSelected = (card) => {
        const advCardId=card.id;
        state.viewingPlayer || isServerHost?
        axios.post('/api/gameaction', {token: token, playerId: player.id, gameId: game.id, targetPlayerId: state.viewingPlayer.id, advCardId: advCardId, type:'advCardSelect'})
        .then(response=>{
            setGame(response.data.game);
        }):null; 
    };

    const handleCardRemove = (card) => {
        if (isServerHost) {
            const data = {
                type: 'advCardRemove',
                playerId: player.id,
                targetPlayerId: state.viewingPlayer.id,
                gameId: game.id,
                advCardId: card.id,
                token
            };
            axios.post('/api/gameaction', data)
            .then(response=>{setGame(response.data.game)});
        };
    };

    const costFor = (card, player) => {
        if (player.advCards) {
        const pgroupContrib = player?.credits[card.pgroup];
        const sgroupContrib = card.sgroup? player?.credits[card.sgroup]: 0;
        const creditToContribArray = player.advCards.filter(cardF=>cardF.creditTo? cardF.creditTo.name===card.name: false).map(cardM=>cardM.creditTo.amount);
        const creditToContrib = creditToContribArray[0] || 0;
        const total = Math.min(Math.max(pgroupContrib, sgroupContrib) + creditToContrib, card.price);
        return card.price - total} else {return 0};
    };

    const CivCard = (card, key) => {
            
        const pcolor = colors[card.pgroup];
        const scolor = card.sgroup? colors[card.sgroup]: pcolor;
        const points = card.price < 100? 1: card.price < 200? 3: card.price? 6: 0
        const titleStyle = {backgroundImage: `linear-gradient(to right, ${pcolor}, ${scolor})`};
        const creditsUP = Object.keys(card.credits).map(group=>[group, card.credits[group]]).filter(credit=>credit[1]);
        const cardIsSelected = state.viewingPlayer?.advCardsSelection.filter(cardSelected=>card.id===cardSelected.id).length>0;
        const cardIsOwned = state.viewingPlayer?.advCards.filter(cardOwned=>card.id===cardOwned.id).length>0;
        const costForViewing = costFor(card, state.viewingPlayer);
        const subTexts = card.texts.split('#');
        const MainText = subTexts[0]? <p>{sentance(subTexts[0])}</p>: null;
        const parseSub = (sub, key) => <div key={key}><h6 className="my-0">{title(sub.split(': ')[0])}</h6><p>{sentance(sub.split(': ')[1])}</p></div>
        const CatTexts = () => <>{subTexts.slice(1).map(parseSub)}</>;
        const text = <>{MainText}{CatTexts()}</>;
       
        return(
        <div className="col-6 col-sm-4 col-xl-3 p-1 m-0" key={key}>
            <div className={'adv-card '+(cardIsOwned? 'owned-card-border': cardIsSelected? 'selected-card-border': 'default-card-border')}  onClick={()=>state.viewingMode==='browser'? handleCardSelected(card): handleCardRemove(card)}>
                
                {/* top half */}
                <div className="card-top">
                    
                    {/* title row*/}
                    <div className="card-title" style={titleStyle}>{title(card.name)}</div>

                    {/* price row */}
                    <div className="top-row">
                        <div className="left-wrapper">
                            {/* price */}
                            <div className={`price-circle ${costForViewing!=card.price && !cardIsOwned? 'price-lower':''}`}><div className="tokens-inner">{card.price}</div></div>
                            {/* costFor */}
                            {costForViewing!=card.price && !cardIsOwned? <div className="price-circle"><div className="tokens-inner">{costForViewing}</div></div>: null}
                        </div>
                        {cardIsOwned? <div className="owned-tag">Owned</div>:null}
                        {/* points */}
                        <div className="right-wrapper points-square">{points}</div>
                    </div>
                </div>

                {/* bottom half */}
                <div className="card-bottom">

                    {/* credits column */}
                    <div className="credits-column">
                        {creditsUP.map((credit, key)=><div className="credits-circle" key={key} style={{backgroundColor: colors[credit[0]]}}><div className="tokens-inner">{credit[1]}</div></div>)}
                    </div>

                    {/* text column */}
                    <div className="text-column">

                        {/* text preview */}
                        <div className="text-wrapper">{text}</div>

                        {/* credit to */}
                        <div className="credit-to">{card.creditTo? card.creditTo.amount + ' to ' + title(card.creditTo.name): null}</div>
                    </div>
                </div>
            </div>
        </div>)
    };

    const Scoreboard = () => {

        const sortedPlayers = (
            state.sortMode==='player'? [...game.players].sort((player, otherPlayer)=>{
                const username = player.username.toUpperCase(); 
                const otherUsername = otherPlayer.username.toUpperCase();
                return (username > otherUsername)? (state.sortAcs? -1: 1): (otherUsername > username)? (state.sortAcs? 1: -1): 0}):
            state.sortMode==='score'? [...game.players].sort((player, otherPlayer)=>{return state.sortAcs? player.score-otherPlayer.score: otherPlayer.score-player.score}):
            state.sortMode==='cities'? [...game.players].sort((player, otherPlayer)=>state.sortAcs? player.cities-otherPlayer.cities: otherPlayer.cities-player.cities):
            state.sortMode==='census'? [...game.players].sort((player, otherPlayer)=>state.sortAcs? player.census-otherPlayer.census: otherPlayer.census-player.census):
            game.players);

        const handlePlayerSelect = (playerRow) => {setState({...state, viewingPlayer: playerRow, viewingMode: 'card'})};

        const handleEndTurn = () => {
            if (isServerHost) {
                const data = {
                    playerId: player.id,
                    targetPlayerId: player.id,
                    token,
                    gameId: game.id,
                    type: 'endTurn'
                };
                axios.post('/api/gameaction', data)
                .then(response=>{setGame(response.data.game)});
                axios.post('/api/history', data)
                .then(response=>{setHistory(response.data.turns)});
            };
        };

        const renderPlayerRow = (playerRow, key) => {

            const playerIsHost = playerRow.isHost;
            const playerHasSelection = playerRow.advCardsSelection.length>0;
            const playerIsReady = playerRow.selectionReady;
            const symbols = [playerIsHost? '\u2B50': null, playerIsReady && !playerHasSelection? '\u2713': null, playerHasSelection? '\u26A0': null];
            const civStyle = {backgroundColor: playerRow.color};
            const playerIsRow = player.id===playerRow.id;

            const handleCitiesChange = (event, playerRow) => {
                const cities = !isNaN(event.target.value) && !isNaN(parseInt(event.target.value))? parseInt(event.target.value): 0;
                const data = {
                    type: 'citiesChange',
                    playerId: player.id,
                    targetPlayerId: playerRow.id,
                    gameId: game.id,
                    token,
                    cities,
                };
                if (playerIsRow || isServerHost) {
                    axios.post('/api/gameaction', data)
                    .then(response=>setGame(response.data.game));
                };
            };

            const handleCensusChange = (event, playerRow) => {
                const census = !isNaN(event.target.value) && !isNaN(parseInt(event.target.value))? parseInt(event.target.value): 0;
                const data = {
                    type: 'censusChange',
                    playerId: player.id,
                    targetPlayerId: playerRow.id,
                    gameId: game.id,
                    token,
                    census,
                };
                if (playerIsRow || isServerHost) {
                    axios.post('/api/gameaction', data)
                    .then(response=>setGame(response.data.game));
                };
            };
    
            return (
               <tr className="p-0" key={key}>
                    {/* symbols */}
                    <td className="p-0 align-middle" >{symbols.join(' ')}</td>
                    {/* name/ civ */}
                    <td className="p-0 align-middle" ><button className="h-100 col-12 p-0 border border-dark" style={civStyle} onClick={()=>handlePlayerSelect(playerRow)}><h6 className="p-0 m-0">{capitalize(playerRow.username)}</h6><p className="p-0 m-0">{capitalize(playerRow.civ)}</p></button></td>
                    {/* cities */}
                    <td className="p-0 align-middle"><input className="cities p-0 m-0" type="number" onChange={(event)=>handleCitiesChange(event, playerRow)} disabled={!(playerIsRow || isServerHost)} value={playerRow.cities}/></td>
                    {/* census */}
                    <td className="p-0 align-middle"><input className="census p-0 m-0" type="number" onChange={(event)=>handleCensusChange(event, playerRow)} disabled={!(playerIsRow || isServerHost)} value={playerRow.census}/></td>
                    {/* score */}
                    <td className="p-0 align-middle" ><div className={'score px-1 mx-auto ' + (playerRow.canAdvance? 'advancing': '')}>{playerRow.score}</div></td>
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
                {/* sub-header */}
                <h5>{capitalize(game.host)}'s Game</h5>
                <div className="d-flex mb-2 align-items-center">  
                    {/* add cards */}
                    <span>
                        <button type="button" className="btn btn-small btn-dark p-1 m-0 me-1" onClick={()=>setState({...state, viewingMode: 'browser', viewingPlayer: game.players.filter(playerF=>playerF.id===player.id)[0]})}>
                            <PlusSquare width={25} height={25}/>
                        </button>
                    </span>
                    {/* history */}
                    <span>
                        <button type="button" className="btn btn-small btn-dark p-1 m-0 me-1" onClick={()=>setState({...state, viewingMode: 'history'})}>
                            <BarChartLine width={25} height={25}/>
                        </button>
                    </span>
                    {/* info */}
                    <span>
                        <button type="button" className="btn btn-small btn-dark p-1" onClick={()=>setState({...state, viewingMode: 'info'})}>
                            <InfoSquare width={25} height={25}/>
                        </button>
                    </span>
                    {/* turn number */}
                    <span className="ms-auto">
                        Turn number: {game.turnNumber}
                    </span>
                    {/* end turn button */}
                    <span className="ms-1">
                        {isServerHost? <button className="btn btn-dark btn-sm d-block p-1" onClick={handleEndTurn}>{game.isEnding? <StopBtn width={25} height={25}/>: <SkipEndBtn width={25} height={25}/>}</button>:null}
                    </span>
                </div>
                {/* scoreboard table */}
                <table className="table border border-dark bg-light">
                    <thead><tr>
                        {/* symbol column */}
                        <th scope="col"></th>
                        {/* username column */}
                        <th scope="col">Player{renderSortFor('player')}</th>
                        {/* cities column */}
                        <th scope="col">Cities{renderSortFor('cities')}</th>
                        {/* census column */}
                        <th scope="col">Census{renderSortFor('census')}</th>
                        {/* score column */}
                        <th scope="col">Score{renderSortFor('score')}</th>
                    </tr></thead>
                    <tbody>{sortedPlayers.map(renderPlayerRow)}</tbody>
                </table>
            </div>
        );
    };
    
    const handlePurchaseSubmit = () => {
        // probably want some confirmation step here
        if (isServerHost || player.id===state.viewingPlayer.id) {
        axios.post('/api/gameaction', {token:token, playerId:player.id, targetPlayerId: state.viewingPlayer.id, type:'advCardPurchase'})
        .then(response=>setGame(response.data.game))
        };
    };

    const Browser = () => {

        // filter colors
        const advCardsFilterColors = (
            Object.values(state.filterColor).every(color=>!color)? advCards:
            advCards.filter(card=>Object.entries(state.filterColor).filter(([group, isFilter])=>isFilter?(card.pgroup===group||card.sgroup===group):false).length>0));

        const advCardsFilterText = state.query? advCardsFilterColors
            .filter(card=>{
                const hasTexts = card.name.includes(state.query);
                const hasTitle = card.texts.includes(state.query);
                return hasTexts || hasTitle;
            }): advCardsFilterColors;

        const advCardsSortedByCat = (
            state.sortMode==='name'? [...advCardsFilterText].sort((card, otherCard)=>{
                const name = card.name.toUpperCase(); 
                const otherName = otherCard.name.toUpperCase();
                return (name > otherName)? (state.sortAcs? -1: 1): (otherName > name)? (state.sortAcs? 1: -1): 0}):
            state.sortMode==='price'? [...advCardsFilterText].sort((card, otherCard)=>{
                const price = state.viewingMode==='browser'? costFor(card, state.viewingPlayer): card.price;
                const otherPrice = state.viewingMode==='browser'? costFor(otherCard, state.viewingPlayer): otherCard.price;
                return (state.sortAcs? otherPrice - price: price - otherPrice)}):
            advCardsFilterText
        );

        const advCardsSortedByStatus = [...advCardsSortedByCat].sort((card, otherCard)=>{
            const cardLevel = state.viewingPlayer?.advCards.map(cardM=>cardM.id).includes(card.id)? 1: state.viewingPlayer.advCardsSelection.map(cardM=>cardM.id).includes(card.id)? -1: 0;
            const otherCardLevel = state.viewingPlayer?.advCards.map(cardM=>cardM.id).includes(otherCard.id)? 1: state.viewingPlayer.advCardsSelection.map(cardM=>cardM.id).includes(otherCard.id)? -1: 0;
            return cardLevel - otherCardLevel
        }) || advCardsSortedByCat
    
        const handleQueryChange = async (event) => {
            event.preventDefault();
            const query = event.target.value.toLowerCase();
            setState({...state, query})
        };

        const changeSortMode = (mode) => {
            setState({...state, sortMode: mode})
        };

        const cartPrice = state.viewingPlayer.advCardsSelection.reduce((partial, current)=>partial+costFor(current, state.viewingPlayer), 0);
        const numberOfSelected = state.viewingPlayer.advCardsSelection.length

        return (<div>
            <nav className="navbar sticky-top navbar-light bg-light border-dark border-bottom mx-n2">
                <div className="row flex-row justify-content-start align-items-center mb-1 d-none d-md-flex w-100 p-0 m-0 mx-2">
                    {/* cart price */}
                    <div className="price-circle ms-1">{cartPrice}</div>
                    {/* confirm cart */}
                    <div className="col-6 p-0 m-0 text-start"><button className="btn btn-light btn-small" disabled={!isServerHost} onClick={handlePurchaseSubmit}>{capitalize(state.viewingPlayer.username)}'s Cart</button></div>
                </div>
                <div className="row flex-sm-row-reverse flex-row mb-1 align-items-bottom w-100 p-0 m-0 mx-2">
                    <div className="col-12 col-md-6 mb-2 mb-md-0 m-0 p-0">
                        <div className="row flex-row justify-content-between justify-content-md-end align-items-center p-0 m-0">
                            <div className="col-5 d-md-none p-0 m-0">
                                <div className="d-flex align-items-center p-0 m-0">
                                    {/* confirm */}
                                    {isServerHost? <div>
                                        <button className="btn btn-dark btn-small p-1" disabled={!isServerHost} onClick={handlePurchaseSubmit}>
                                            <CheckSquare width={25} height={25}/>
                                        </button>
                                    </div>: null}
                                    {/* cart price */}
                                    <div className="ms-1 price-circle">{cartPrice}</div>
                                    {/* cart name */}
                                    <div className="ms-1">{capitalize(state.viewingPlayer.username)}'s Cart</div>
       
                                </div>
                            </div>
                            <div className="col-7 col-md-12 p-0 m-0">
                                <div className="row flex-row justify-content-end p-0 m-0">
                                    {/* blue toggle */}
                                    <div className="credit-filter p-0 m-0 me-1">
                                        <label  htmlFor="filter-blue">
                                            <input type="checkbox" id="filter-blue" checked={state.filterColor.blue} onChange={()=>setState({...state, filterColor: {...state.filterColor, blue: !state.filterColor.blue}})}/>
                                            <span className="blue">{state.viewingPlayer.credits.blue}</span>
                                        </label>
                                    </div>
                                    {/* red toggle */}
                                    <div className="credit-filter p-0 m-0 me-1">
                                        <label htmlFor="filter-red">
                                            <input type="checkbox" id="filter-red" checked={state.filterColor.red} onChange={()=>setState({...state, filterColor: {...state.filterColor, red: !state.filterColor.red}})}/>
                                            <span className="red">{state.viewingPlayer.credits.red}</span>
                                        </label>
                                    </div>
                                    <div className="credit-filter p-0 m-0 me-1">
                                        <label htmlFor="filter-green">
                                            <input type="checkbox" id="filter-green" checked={state.filterColor.green} onChange={()=>setState({...state, filterColor: {...state.filterColor, green: !state.filterColor.green}})}/>
                                            <span className="green">{state.viewingPlayer.credits.green}</span>
                                        </label>
                                    </div>
                                    <div className="credit-filter  p-0 m-0 me-1">
                                        <label htmlFor="filter-yellow">
                                            <input type="checkbox" id="filter-yellow" checked={state.filterColor.yellow} onChange={()=>setState({...state, filterColor: {...state.filterColor, yellow: !state.filterColor.yellow}})}/>
                                            <span className="yellow">{state.viewingPlayer.credits.yellow}</span>
                                        </label>
                                    </div>
                                    <div className="credit-filter p-0 m-0">
                                        <label htmlFor="filter-orange">
                                            <input type="checkbox" id="filter-orange" checked={state.filterColor.oragne} onChange={()=>setState({...state, filterColor: {...state.filterColor, orange: !state.filterColor.orange}})}/>
                                            <span className="orange">{state.viewingPlayer.credits.orange}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 p-0 m-0">
                        <div className="input-group">
                            <input className="form-control form-control-sm" type="text" id="query" placeholder="Seach for Card" value={state.query} onChange={handleQueryChange}></input>
                            <span className="input-group-text">Sort By: </span>
                            <input type="radio" className=" btn-check" name="btnradio" id="sort-by-name"autoComplete="off" checked={state.sortMode==='name'} onChange={()=>changeSortMode('name')}/>
                            <label className="btn btn-secondary" htmlFor="sort-by-name">Name</label>
                            <input type="radio" className=" btn-check" name="btnradio" id="sort-by-price" autoComplete="off" checked={state.sortMode==='price'} onChange={()=>changeSortMode('price')}/>
                            <label className="btn btn-secondary" htmlFor="sort-by-price">Price</label>
                        </div>
                    </div>
                </div>
            </nav>
            <div>  
                <div className="row m-0 p-0 overflow-md-auto mx-n1">{advCardsSortedByStatus.map(CivCard)}</div>
            </div>
        </div>)

    };

    const Player = () => {

        const viewingPlayer= state.viewingPlayer;
        const playerHasCards = viewingPlayer.advCards?.length>0;
        const playersAdvCards = [...viewingPlayer.advCards].sort((card, otherCard)=>{card.name.toUpperCase()>otherCard.name.toUpperCase()? 1: -1});
        const canMakeSelection = viewingPlayer.id===player.id || isServerHost;

        const handlePurchaseSelect = (event) => {
            event.preventDefault();
            setState({...state, viewingMode: 'browser', sortMode:'name'});
            setCD({...cd, advCardsViewing: advCards})
        }; 

        const handleCreditChange = (event, group) => {
            if (isServerHost) {
                const credits = state.viewingPlayer.credits
                credits[group] = !isNaN(event.target.value) && !isNaN(parseInt(event.target.value))? parseInt(event.target.value): 0;
                const data = {
                    type: 'creditChange',
                    token,
                    playerId: player.id,
                    targetPlayerId: state.viewingPlayer.id,
                    gameId: game.id,
                    credits
                };
                axios.post('/api/gameaction', data)
                .then(response=>setGame(response.data.game));
            };
        };

        return (<div className="col-12">
            <h5>{capitalize(viewingPlayer.username)}</h5>
            <div className="d-flex justify-content-between align-items-center m-0 p-0 pb-2 border-bottom border-dark mx-n2">
                <span className="ms-2">
                    <button type="button" className="btn btn-small btn-dark p-1 m-0 me-1" onClick={()=>setState({...state, viewingMode: 'browser', viewingPlayer: state.viewingPlayer})}>
                        <PlusSquare width={25} height={25}/>
                    </button>
                </span>
                <div className="col-7 p-0">
                    <div className="row flex-row justify-content-end p-0 me-2">
                        <input className="credit blue p-0 me-1" onChange={(event)=>handleCreditChange(event, 'blue')} disabled={!isServerHost} value={state.viewingPlayer.credits.blue}/>
                        <input className="credit red p-0 me-1" onChange={(event)=>handleCreditChange(event, 'red')} disabled={!isServerHost} value={state.viewingPlayer.credits.red}/>
                        <input className="credit green p-0 me-1" onChange={(event)=>handleCreditChange(event, 'green')} disabled={!isServerHost} value={state.viewingPlayer.credits.green}/>
                        <input className="credit yellow p-0 me-1" onChange={(event)=>handleCreditChange(event, 'yellow')} disabled={!isServerHost} value={state.viewingPlayer.credits.yellow}/>
                        <input className="credit orange p-0" onChange={(event)=>handleCreditChange(event, 'orange')} disabled={!isServerHost} value={state.viewingPlayer.credits.orange}/>
                    </div>
                </div>
            </div>
            <div className="row p-0 mx-n1">{playerHasCards? playersAdvCards.map(CivCard): <div className="my-3">Player has no cards</div>}</div>
        </div>)
    };

    const EndGame = () => {return(<div className="mt-3">
        The game is over!
    </div>)};

    return (<div className="d-flex flex-column mx-2">
        <div className="row d-flex justify-content-between mt-3 align-items-center">
            <div className="col-3 d-flex flex-no-wrap justify-conent-start">
                {state.viewingMode!=='board'? 
                // back to scoreboard
                <button className="btn btn-dark btn-sm p-1" onClick={() => setState({...state, viewingPlayer: null, viewingMode: 'board'})}>
                    <Backspace width={25} height={25}/>
                </button>:
                // leave/delete game
                <button className="btn btn-dark btn-sm p-1" onClick={handleLeaveOrDelete}>
                    <XCircle width={25} height={25}/>
                </button>}
            </div>
            {/* title */}
            <h3 className="col-6">Play Civilization</h3>
            <div className="col-3 d-flex flex-no-wrap justify-content-end align-items-center">
                {/* player name */}
                <div className="me-1">{capitalize(player.username)}</div>
                {/* log out */}
                <button className="btn btn-sm btn-danger ms-md-1 p-1" onClick={handleLogout}>
                    <BoxArrowRight width={25} height={25}/>
                </button>
            </div>
        </div>
        {/* game name */}
        {game.isOver? 
            EndGame()
        :state.viewingMode==='card'? 
            Player()
        :state.viewingMode==='browser'?
            Browser()
        :state.viewingMode==='history'?
            <History state={{player, history, state}}/>
        :state.viewingMode==='info'?
            Info()
        :Scoreboard()}
    </div>);
};

export default PlayGame;