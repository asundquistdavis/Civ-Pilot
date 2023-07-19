import React from "react";
import axios from "axios";

const capitalize = (str) => str? str.charAt(0).toUpperCase() + str.slice(1): str;
const title = (str) => str.split(' ').map(capitalize).join(' ')
const sentance = (str) => str?.split('. ')?.map(capitalize).join('. ') || capitalize(str);

const PlayGame = (state, token, cd, player, game, civilizations, advCards, setState, setToken, setCD, setPlayer, setGame, setCivilizations, setAdvCards) => {

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
            .then(response=>{console.log(response);setGame(response.data.game)});
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
            state.sortMode==='civilization'? [...game.players].sort((player, otherPlayer)=>{
                const civName = player.civ.toUpperCase(); 
                const otherCivame = otherPlayer.civ.toUpperCase();
                return (civName > otherCivame)? (state.sortAcs? -1: 1): (otherCivame > civName)? (state.sortAcs? 1: -1): 0}):
            state.sortMode==='score'? [...game.players].sort((player, otherPlayer)=>{return state.sortAcs? player.score-otherPlayer.score: otherPlayer.score-player.score}):
            game.players);

        const handlePlayerSelect = (playerRow) => {setState({...state, viewingPlayer: playerRow, viewingMode: 'card'})};

        const handleCanAdvanceCheck = (playerRow) => {
            const data = {
                type: 'playerAdvance',
                playerId: player.id,
                token,
                targetPlayerId: playerRow.id,
                gameId: game.id
            };
            axios.post('/api/gameaction', data)
            .then(response=>{setGame(response.data.game)});
        };

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
            };
        };

        const renderPlayerRow = (playerRow, key) => {

            const playerIsHost = playerRow.isHost;
            const playerHasSelection = playerRow.advCardsSelection.length>0;
            const playerIsReady = playerRow.selectionReady;
            const symbols = [playerIsHost? '\u2B50': null, playerIsReady? '\u2705': null];
            const civStyle = {backgroundColor: playerRow.color}
            const inputId = `can-advance-${playerRow.id}`;
    
            return (
               <tr key={key}>
                    <td>{symbols.join(' ')}</td>
                    <td><button className="btn btn-sm btn-primary" onClick={()=>handlePlayerSelect(playerRow)}>{capitalize(playerRow.username)}</button></td>
                    <td className="py-3" style={civStyle}>{capitalize(playerRow.civ)}</td>
                    <td><div className="score-advance p-0 mx-auto">
                        <label htmlFor={inputId}>
                            <input type="checkbox" id={inputId} onChange={()=>handleCanAdvanceCheck(playerRow)} checked={playerRow.canAdvance}/>
                            <span>{playerRow.score}</span>
                        </label>
                    </div></td>
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
                <div className="float-end mb-3">
                    {isServerHost? <button className="btn btn-primary" onClick={handleEndTurn}>End Turn {game.turnNumber}</button>: <div>Turn number: {game.turnNumber}</div>}
                </div>
                <div className="bg-light">
                    <table className="table border border-dark">
                        <thead><tr>
                            <th scope="col"></th><th scope="col">Player{renderSortFor('player')}</th>
                            <th scope="col">Civilization{renderSortFor('civilization')}</th>
                            <th scope="col">Score{renderSortFor('score')}</th>
                        </tr></thead>
                        <tbody>{sortedPlayers.map(renderPlayerRow)}</tbody>
                    </table>
                </div>
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
            <h5 className="mb-3 mx-1">{isServerHost? <button className="btn btn-primary me-1" onClick={handlePurchaseSubmit}>Approve &#9989;</button>:null}</h5>
            <nav class="navbar sticky-top navbar-light bg-light border-dark border-bottom">
                <div className="row flex-sm-row-reverse flex-row mb-1 align-items-bottom w-100 mx-1">
                    <div className="col-12 col-md-6 mb-2 mb-md-0">
                        <div className="row flex-row justify-content-between mx-1">
                            <div className="col-4 col-md-2 p-0 d-md-none">
                                <div className="row flex-row align-items-center">
                                    <div className="price-circle">{cartPrice}</div>
                                    <div className="col p-0 m-0 text-start">{capitalize(state.viewingPlayer.username)}'s Cart</div>
                                </div>
                            </div>
                            <div className="col-7 col-md-10 p-0">
                                <div className="row flex-row justify-content-end">
                                    {/* blue toggle */}
                                    <div className="credit-filter blue p-0 me-1">
                                        <label  htmlFor="filter-blue">
                                            <input type="checkbox" id="filter-blue" checked={state.filterColor.blue} onChange={()=>setState({...state, filterColor: {...state.filterColor, blue: !state.filterColor.blue}})}/>
                                            <span>{state.viewingPlayer.credits.blue}</span>
                                        </label>
                                    </div>
                                    {/* red toggle */}
                                    <div className="credit-filter red p-0 me-1 me-md-1">
                                        <label htmlFor="filter-red">
                                            <input type="checkbox" id="filter-red" checked={state.filterColor.red} onChange={()=>setState({...state, filterColor: {...state.filterColor, red: !state.filterColor.red}})}/>
                                            <span>{state.viewingPlayer.credits.red}</span>
                                        </label>
                                    </div>
                                    <div className="credit-filter green p-0 me-1 me-md-1">
                                        <label htmlFor="filter-green">
                                            <input type="checkbox" id="filter-green" checked={state.filterColor.green} onChange={()=>setState({...state, filterColor: {...state.filterColor, green: !state.filterColor.green}})}/>
                                            <span>{state.viewingPlayer.credits.green}</span>
                                        </label>
                                    </div>
                                    <div className="credit-filter yellow p-0 me-1 me-md-1">
                                        <label htmlFor="filter-yellow">
                                            <input type="checkbox" id="filter-yellow" checked={state.filterColor.yellow} onChange={()=>setState({...state, filterColor: {...state.filterColor, yellow: !state.filterColor.yellow}})}/>
                                            <span>{state.viewingPlayer.credits.yellow}</span>
                                        </label>
                                    </div>
                                    <div className="credit-filter orange p-0 me-1 me-md-1">
                                        <label htmlFor="filter-orange">
                                            <input type="checkbox" id="filter-orange" checked={state.filterColor.oragne} onChange={()=>setState({...state, filterColor: {...state.filterColor, orange: !state.filterColor.orange}})}/>
                                            <span>{state.viewingPlayer.credits.orange}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 p-0">
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
                <div className="row mx-1">{advCardsSortedByStatus.map(CivCard)}</div>
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

        return (<div>
            <h5>Viewing {capitalize(viewingPlayer.username)}'s Info</h5>
            <div className="row">
                <div className="col-2"><button className="btn btn-primary mb-2" onClick={handlePurchaseSelect} disabled={!canMakeSelection}>Add Cards</button></div>
            </div>
            <div className="row">{playerHasCards? playersAdvCards.map(CivCard): <div>Player has no cards</div>}</div>
        </div>)
    };

    return (<div className="d-flex flex-column">
        <div className="row d-flex justify-content-between mt-3 mx-1 align-items-center">
            <div className="col-3 d-flex flex-no-wrap justify-conent-start">
                {state.viewingPlayer? 
                // back to scoreboard
                <button className="btn btn-dark btn-sm me-1 p-2" onClick={() => setState({...state, viewingPlayer: null, viewingMode: 'board'})}>
                    <svg width="16" height="16" fill="currentColor" className="bi bi-arrow-left-circle" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z"/>
                    </svg>
                </button>:
                // leave/delete game
                <button className="btn btn-dark btn-sm me-1 p-2" onClick={handleLeaveOrDelete}>
                    <svg width="16" height="16" fill="currentColor" className="bi bi-x-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                </button>}
            </div>
            {/* title */}
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
        {/* game name */}
        {state.viewingMode==='card'? 
            Player()
        :state.viewingMode==='browser'?
            Browser()
        :Scoreboard()}
    </div>);
};

export default PlayGame;