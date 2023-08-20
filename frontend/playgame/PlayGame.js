import React, { useEffect, useState } from "react";
import Base from '../components/Base';
import Header from '../components/Header';
import Button from '../components/Button';
import Settings from './Components/Settings'
import Modal from "../components/Modal";
import { ArrowLeftCircleFill, GearFill } from "react-bootstrap-icons";
import Home from "./Components/Home";
import axios from "axios";
import ManageGames from "./Components/ManageGames";

const PlayGame = () => {

    const [state, setState] = useState({
        onLoad: true,
        view: 'home',
        viewSettings: false,
        token: localStorage.getItem('token'),
        player: null,
        addHostUsername: '',
        addGameId: null,
        gameId: null,
        hostGame: false,
    });

    const settingsButton = <Button handle={()=>setState(state=>{return{...state, viewSettings:!state.viewSettings}})} text={state.viewSettings? <ArrowLeftCircleFill width={25} height={25}/>: <GearFill width={25} height={25}/>}/>

    const backButton = state.view !== 'home'? <Button handle={()=>setState(state=>{return{...state, view: 'home'}})} text={<ArrowLeftCircleFill width={25} height={25}/>}/>: null;

    const getPlayer = () => {
        axios.post('/api/public/player', {'token': state.token})
        .then(response=>{setState(state=>{return {...state, player: response.data.player}})})
    }

    const checkHosts = () => {
        axios.get('/api/public/allgames')
        .then(response=>setState(state=>{return {...state, addGameId: response.data.games.reduce((gameId, game)=>game.host===state.addHostUsername? game.id: gameId, null)}}));
        console.log(state.addGameId)
    };

    useEffect(()=>{
        !state.token? window.location.replace('/'):
        !state.player? getPlayer(): null;
    }, [state.token])

    useEffect(()=>{
        (state.gameId && state.player)? getGame(): null;
    }, [state.gameId, state.player]);
        
    useEffect(()=>{
        checkHosts();
    }, [state.addHostUsername])

    return (<>
        <Base>
            <Header buttonL={backButton} buttonR={settingsButton} text='hello'/>
            {!state.gameId? <ManageGames state={state} setState={setState}/>: <Home state={state} setState={setState}/>}
        </Base>
        {state.viewSettings? <Settings buttonL={settingsButton} text={'Settings'}/>:null}
    </>)
};

export default PlayGame;
