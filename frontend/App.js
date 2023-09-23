import React, { useEffect, useState } from "react";
import Base from "./components/Base";
import Auth from './auth/Auth';
import Footer from "./components/Footer";

const App = () => { 

    const { info, setInfo } = useState();
    const state = loadState('...');
    const [ game, setGame ] = useAsyncData('...')
    return (
        <Base footer={<Footer/>}>
        {
            state === State.Auth?
                <Auth/>:
            state === State.AddGame?
                {}:
            state === State.NewGame?
                {}:
            state === State.PlayGame?
                {}:
            <Loading/>
        }
        </Base>
    );
};

class State {
    static Auth = new State('auth')
    static AddGame = new State('add game')
    static NewGame = new State('new game')
    static PlayGame = new State('play game')
    constructor(stateName) {
        this.stateName = stateName
    }
}

const loadState = () => {
    const state = State.Auth;
    return state;
};

const useAsyncData = (endPoint) => {
    const { data, setData } = useState();
    return [ data, setData ];
};

const Loading = () => {

    return (
        <div>Loading</div>
    );
};

export default App;
