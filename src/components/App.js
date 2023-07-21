import React, { useEffect, useState } from "react";
import Auth from "./Auth";
import NewGame from "./NewGame";
import PlayGame from "./PlayGame";
import axios from "axios";

const App = () => {

    // states
    const [state, setState] = useState({
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

    // client data
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [cd, setCD] = useState({
        username: '',
        password: '',
        passwordRepeat: '',
        hostName: '',
        advCardsViewing: [],
        errorMessage: null
    });

    // server data
    const [player, setPlayer] = useState(null);
    const [game, setGame] = useState(null);
    const [civilizations, setCivilizations] = useState([]);
    const [advCards, setAdvCards] = useState([]);
    const [usernames, setUsernames] = useState([]);

    const getUsernames = async () => {
        axios.get('/api/usernames')
        .then(response=>{setUsernames(response.data.usernames);})
        .catch(error=>setErrorMessage(error.response.data.message));
    };

    const getPlayerInfo = () => {
        if (token) {
            axios.post('/api/player', {token: token})
            .then(response=>setPlayer(response.data.player))
            .catch(error=>{
                const message = error.response.data.message;
                console.log(message);
                if (message === 'invalid credentials') {
                    localStorage.clear();
                    setToken(null);
                };
            });
        };
    };

    const getGameInfo = () => {
        if (token && player) {
            axios.post('/api/game', {token:token, playerId: player.id, type: 'get'})
            .then(response=>setGame(response.data.game))
            .catch(error=>{
                const message =  error.response.data.message;
                setCD({...cd, errorMessage: message});
                message==='game dne'? setGame(null): null;
            });
        };
    };

    const getCivilizations = () => {
        axios.get('api/civilizations')
        .then(response=>setCivilizations(response.data.civilizations))
        .catch(error=>{
            const message = error.response.data.message;
            setCD({...cd, errorMessage: message})
        });
    };

    const getAdvCards = () => {
        axios.get('api/advcards')
        .then(response=>setAdvCards(response.data.advCards))
        .catch(error=>setCD({...cd, errorMessage: error.response.data.message}));
    };

    useEffect(()=>{
        const localToken = localStorage.getItem(token);
        if (localToken) {setToken(localToken)};
        getPlayerInfo();
        // if (token===null) {setCD({...cd, errorMessage: null})};
    }, [token]);

    useEffect(()=>{
        getGameInfo();
    }, [player]);

    useEffect(()=>{
        getAdvCards();
        getCivilizations();
        setState({...state, viewingPlayer: game?.players?.filter(player=>player.id===state?.viewingPlayer?.id)[0]})
    }, [game]);

    useEffect(()=>{
        if (cd.hostName) {
            getUsernames()
            const validGameId = usernames.filter(user=>user.username===cd.hostName)?.[0]?.hostedGameId
            setState({...state, validGameId});
        }
    }, [cd.hostName]);

    const Loading = () => {
    
        return (<div>Loading...</div>)};
    
    const Error = () => {return (<><div>Something went wrong</div>{cd.errorMessage? <div>{cd.errorMessage}</div>:null}</>)};

    const Alert = () => {
        return (
            <div className="alert-screen">
                <div className="row my-5">
                    <div className="col-8 col-sm-4 mx-auto bg-light p-3 border border-dark rounded">
                        <div className="row text-center mb-2">{state.alert.message}</div>
                        <div className="row d-flex flex-row justify-content-center">
                            <div className="col px-0 text-center"><button className="btn btn-danger" onClick={state.alert.action}>{state.alert.actionMessage}</button></div>
                            <div className="col px-0 text-center"><button className="btn btn-secondary" onClick={()=>setState({...state, alert:null})}>Back</button></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid pt-md-5">
            <div className="row">
                <div className="col-sm-12 col-md-8 mx-md-auto px-0 border border-dark text-center bg-light my-vh-100 overflow-y-auto overflow-x-hidden overflow-md-none">
                    {!token?
                        Auth(state, token, cd, setState, setToken, setCD)
                    :(player && (!game || (game && !game.turnNumber)))?
                        NewGame(state, token, cd, player, game, civilizations, advCards, setState, setToken, setCD, setPlayer, setGame, setCivilizations, setAdvCards, usernames, setUsernames)
                    :(player && game && game.turnNumber)?
                        PlayGame(state, token, cd, player, game, civilizations, advCards, setState, setToken, setCD, setPlayer, setGame, setCivilizations, setAdvCards)
                    :cd.errorMessage?
                        Error():
                    Loading()}
                </div>
            </div>
            {state.alert? Alert():null}
        </div>
    );
};

export default App;


