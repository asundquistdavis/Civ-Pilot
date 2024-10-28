import axios from "axios";
import React from "react";
import { PlayBtn, PlusCircle, StopBtn } from "react-bootstrap-icons";

const capitalize = (str) => str? str.charAt(0).toUpperCase() + str.slice(1): str;
const title = (str) => str.split(' ').map(capitalize).join(' ')
const sentance = (str) => str?.split('. ')?.map(capitalize).join('. ') || capitalize(str);

const Trade = (state, setState, game, setGame, player, token) => {

    const isServerHost = game.hostId === player.id;

    const isTrade = game.isTrade;

    const playerInfo = game.players.find(_player=>_player.id===player.id)

    // console.log(playerInfo)

    const byPurchaseOrder = (playerA, playerB) => {
        const citiesA = playerA.cities;
        const citiesB = playerB.cities;
        const astA = playerA.astRank;
        const astB = playerB.astRank;
        return citiesA - citiesB - (astB - astA)/18
    }

    let tradeCardSelect = (card) => {};

    const startTrade = () => {
        const data = {
            playerId: player.id,
            token,
            gameId: game.id,
            type: 'startTrade'
        };
        axios.post('api/gameaction', data)
        .then(response=>setGame(response.data.game))
    }

    const endTrade = () => {
        const data = {
            playerId: player.id,
            token,
            gameId: game.id,
            type: 'endTrade'
        };
        axios.post('api/gameaction', data)
        .then(response=>setGame(response.data.game))
    };

    const tradeCardXL = (card) => {

        return (<div>
            <div className="tradeCardXLName">{card.name}</div>
        </div>);
    };

    const tradeCardLarge = (card, key) => {
        const box = (_, k) => <div key={k} className="tradeCardLargeBox">{(k+1)**2*card.level}</div>
        const boxes = !card.qualifier? Array.from(Array(card.max_quantity)).map(box): <></>
        
        return (
            <div
            key={key}
            onClick={()=>tradeCardSelect(card)}
            selected={card.selected}
            className="tradeCardLarge">
                <div
                style={{'--color': card.pcolor}}
                className="tradeCardLargeContent">
                    <div className="tradeCardLargeName">{card.name}</div>
                    <div className="tradeCardLargeLevel">{card.level}</div>
                    <div className="tradeCardLargeBoxes">{boxes}</div>
                </div>
            </div>
        )
    };

    const tradeCardHand = (cards) => {
        return (
            <div className="tradeCardHand">
                {cards.map(tradeCardLarge)}
            </div>
        )
    };

    const startTradeButton = <>
        <button 
        onClick={startTrade} 
        disabled={!isServerHost}
        className="btn btn-dark">
            <PlayBtn width={25} height={25}/>
        </button>
    </>

    const endTradeButton = <>
        <button
        onClick={endTrade} 
        disabled={!isServerHost}
        className="btn btn-dark">
            <StopBtn width={25} height={25}/>
        </button>
    </>

    const decksButton = <>
        <button 
        onClick={()=>setState(state=>({...state, tradeMode: 'decks'}))}
        className={"btn btn-small " + (state.tradeMode==='decks'? 'btn-dark': 'btn-outline-dark')}>
            Decks
        </button>
    </>

    const playersButton = <>
        <button 
        onClick={()=>setState(state=>({...state, tradeMode: 'players'}))}
        className={"btn btn-small " + (state.tradeMode==='players'? 'btn-dark': 'btn-outline-dark')}>
            Players
        </button>
    </>

    const addCard = (deckId) => {
        const data = {
            type: 'addTradeCard',
            playerId: player.id,
            gameId: game.id,
            deckId: deckId,
            token
        }
        axios.post('/api/gameaction', data)
        .then(response=>setGame(response.data.game))
    };

    const removeCard = (purchaseId) => {
        const data = {
            type: 'removeTradeCard',
            playerId: player.id,
            gameId: game.id,
            purchaseId,
            token
        }
        axios.post('/api/gameaction', data)
        .then(response=>setGame(response.data.game))
    }

    const playerTag = (_player, key) =>{
        const isPlayer = _player.id===player.id;
        return (
        <div key={key}
        style={{'--color': _player.color}}
        disabled={!(isPlayer||isServerHost)}
        onClick={()=>removeCard(_player.purchases[0])}
        className="purchaseTag">
            <div className="playerTagName">
                {capitalize(_player.username)}
            </div>
            <div className="playerTagCiv">
                {capitalize(_player.civ)}
            </div>
            <div className="playerTagNumber">
                {_player.purchases.length}
            </div>
        </div>)
    };

    const collect = (purchases) => {
        const players = [];
        purchases.forEach(purchase => {
            let  player = players.find(player=>player.id===purchase.playerId)
            if (!player) {
                player = {...game.players.find(player=>player.id===purchase.playerId), purchases: []}
                players.push(player)
            }
            player.purchases.push(purchase.id)
        });
        return players.slice().sort(byPurchaseOrder)
    } 

    const deck = (deck, key) => {
        const players = collect(deck.purchasing);
        return(        
        <li key={key}
        className="deckItem">
            <div
            className="deckCard"
            onClick={()=>addCard(deck.id)}>
                <div className="deckNumber">
                    {deck.level}
                </div>
                <div className="deckSize">
                    {deck.cards.length + ' Cards'}
                </div>
            </div>
            <div className="deckRow">
                {players.map(playerTag)}
            </div>
        </li>)
    }

    const decks = <>
            <ul className="unset">
                {game.decks.sort((a, b)=>a.level>b.level? -1: 1).map(deck)}
            </ul>
        </>

    const playerRow = (_player, key) => (
    <tr key={key}
    scope="row"
    className="tradeWithPlayerRow">
        <td scope="col">{playerWith(_player)}</td>
        <td scope="col">{cardsBadge(_player.tradeCards.length)}</td>
        <td scope="col">{tradeWants(_player)}</td>
        <td scope="col">{tradeHas(_player)}</td>
    </tr>)

    const cardsBadge = (number) => (
        <div
        className="cardsBadge">
            {number}
        </div>)

    const tradeWith = (_player) => {
        // console.log(playerInfo.tradeCards)
        tradeCardSelect = (card) => {
            const data = {
                type: 'addTradeCardTransaction',
                playerId: player.id,
                targetPlayerId:_player.id,
                cardId: card.id,
                gameId: game.id,
                token,
            }
            console.log(card)
            axios.post('/api/gameaction', data)
            .then(response=>setGame(response.data.game))
        };
        playerInfo.tradeCards.forEach(card=>card.selected=card.transactions.find(status=>status===_player.id))
        setState(state=>({
            ...state, 
            alert: {
                message: 'Trading with ' + capitalize(_player.username),
                content() {
                    return (<>
                        <div className="tradeWithRow">
                            <div className="tradeWithGiving">
                                <div>{console.log(playerInfo.tradeCards)}</div>
                                <div className="tradeWithGivingList">

                                </div>
                            </div>
                            <div className="tradeWithReceiving">
                                <div className="tradeWithReceivingList">Receiving</div>
                            </div>
                        </div>
                        {tradeCardHand(playerInfo.tradeCards)}
                    </>)
                }
            },
        }));
    };

    const playerWith = (_player, key) =>{
        return (
        <div key={key}
        style={{'--color': _player.color}}
        onClick={()=>tradeWith(_player)}
        className="purchaseTag">
            <div className="playerTagName">
                {capitalize(_player.username)}
            </div>
            <div className="playerTagCiv">
                {capitalize(_player.civ)}
            </div>
        </div>)
    }

    const tradeWants = (_player) => {
        if (_player.wants.length===0) {
            return (
                <div>
                    None
                </div>
            )
        }
        return (
            <div>

            </div>
        );
    };

    const tradeHas = (_player) => {
        if (_player.has.length===0) {
            return (
                <div>
                    None
                </div>
            )
        }
        (
            <div>

            </div>
        );
    };

    const tradeWithPlayers = <>
        <table
        className="table border border-dark bg-light">
            <thead>
                <tr scope="row">
                    <th scope="col">Player</th>
                    <th scope="col">Cards</th>
                    <th scope="col">Wants</th>
                    <th scope="col">Has</th>
                </tr>
            </thead>
            <tbody>
                {game.players.filter(_player=>_player.id!=player.id).map(playerRow)}
            </tbody>
        </table>
        {tradeCardHand([{"name": "salt", "level": 3, "max_quantity": 9, "qualifier": "", "pcolor": "red"}])}
    </>

    return (
        <div className='row'>
            <div className='col-12'>
                {/* header */}
                <h5>{state.tradeMode==='decks'? 'Trade Card Decks': 'Trade With Players'}</h5>
                <div className='d-flex flex-row my-2'>
                    <span className="me-2">
                        {decksButton}
                    </span>
                    <span className="me-auto">
                        {playersButton}
                    </span>
                    <span>
                        {isTrade? endTradeButton: startTradeButton}
                    </span>
                </div>
                {state.tradeMode==='decks'? decks: tradeWithPlayers}
            </div>
        </div>
    );
}

export default Trade
