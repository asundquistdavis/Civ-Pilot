import React, { useEffect, useState } from "react";
import Base from '../components/Base';
import Header from '../components/Header';
import Button from '../components/Button';
import Settings from './Components/Settings'
import { ArrowLeftCircleFill, GearFill } from "react-bootstrap-icons";
import axios from "axios";
import AddGame from "./Components/AddGame";
import Lobby from "./Components/Lobby";
import Scoreboard from "./Components/Scoreboard";
import Modal from "../components/Modal";

const PlayGame = () => {

    const [state, setState] = useState({
        onLoad: true,
        view: 'scoreboard',
        viewSettings: false,
        token: localStorage.getItem('token'),
        player: null,
        addHostUsername: '',
        addGameId: null,
        hostGame: false,
        visit: false,
        civilizations: null,
        testView: null,
    });

    const settingsButton = <Button handle={()=>setState(state=>{return{...state, viewSettings:!state.viewSettings}})} text={state.viewSettings? <ArrowLeftCircleFill width={25} height={25}/>: <GearFill width={25} height={25}/>}/>;

    const backButton = state.visit? <Button handle={()=>setState(state=>{return{...state, view: 'scoreboard'}})} text={<ArrowLeftCircleFill width={25} height={25}/>}/>: null;

    const getPlayer = () => {
        axios.post('/api/public/player', {'token': state.token})
        .then(response=>{setState(state=>{return {...state, player: response.data.player}})})
    };

    const getGame = () => {
        const data = {
            token: state.token,
            gameId: localStorage.getItem('gameId')
        };
        axios.post('/api/public/game/get', data)
        .then(response=>setState(state=>{return {...state, game: response.data.game}}))
    };

    const getCivlizations = () => {
        axios.get('/api/public/civilizations')
        .then(response=>setState(state=>{return {...state, civilizations: response.data.civilizations}}))
    };

    const checkHosts = () => {
        axios.get('/api/public/allgames')
        .then(response=>setState(state=>{return {...state, addGameId: response.data.games.reduce((gameId, game)=>game.host===state.addHostUsername? game.id: gameId, null)}}));
    };

    useEffect(()=>{
        getCivlizations();
        !state.token? window.location.replace('/'):
        !state.player? getPlayer(): null;
    }, [state.token]);

    useEffect(()=>{
        if (state.player?.games?.[0]) {localStorage.setItem('gameId', state.player.games[0].id); getGame()}
        else {localStorage.removeItem('gameId'); setState(state=> {return {...state, game: null}})};
    }, [state.player]);
        
    useEffect(()=>{
        checkHosts();
    }, [state.addHostUsername]);

    useEffect(()=>{
        console.log('game change')
        if (state.game && state.game.turnNumber>0) {setState(state=>{return {...state, view: 'scoreboard'}})}
        else if (state.game) {setState(state=>{return {...state, view: 'lobby'}})}
        else {setState(state=>{return {...state, view: 'add game'}})}
    }, [state.game]);

    return (<>
        <Base>
            <Header buttonL={backButton} buttonR={settingsButton} text='Mega Civilization'/>
            {
            state.view==='scoreboard'? <Scoreboard state={state} setState={setState}/>: 
            state.view==='lobby'? <Lobby state={state} setState={setState}/>:
            <AddGame state={state} setState={setState}/>
            }
        </Base>
        {state.viewSettings? <Settings state={state} setState={setState}/>:null}
    </>);
};

export default PlayGame;
