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
        graphMode: 'score',
        infoMode: 'pop',
        calamities: null,
        infoSort: '',
        infoColor: {green: false, blue: false, orange: false, yellow: false, red: false},
        infoSort: null,
        infoQuery: '',
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
    const [history, setHistory] = useState(null);

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
            getHistory();
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

    const getCalamities = () => {
        axios.get('api/calamities')
        .then(response=>setState({...state, calamities: response.data.calamities}))
    }

    const getAdvCards = () => {
        axios.get('api/advcards')
        .then(response=>setAdvCards(response.data.advCards))
        .catch(error=>setCD({...cd, errorMessage: error.response.data.message}));
    };

    const getHistory = () => {
        const data = {
            playerId: player.id,
            token,
        };
        axios.post('api/history', data)
        .then(response=>{setHistory(response.data.history)});
    };

    useEffect(()=>{
        if (state.viewingMode==='history') {
            getHistory();
            state.graphMode==='score'? null: setState({...state, graphMode: 'score'})
        };
    }, [state.viewingMode]);

    useEffect(()=>{
        const localToken = localStorage.getItem(token);
        if (localToken) {setToken(localToken)};
        getPlayerInfo();
    }, [token]);

    useEffect(()=>{
        getGameInfo();
        getAdvCards();
        getCivilizations();
        getCalamities();
    }, [player]);

    useEffect(()=>{
        setState({...state, viewingPlayer: game?.players?.filter(player=>player.id===state?.viewingPlayer?.id)[0]})
    }, [game]);

    useEffect(()=>{
        if (cd.hostName) {
            getUsernames()
            const validGameId = usernames.filter(user=>user.username===cd.hostName)?.[0]?.hostedGameId
            setState({...state, validGameId});
        }
    }, [cd.hostName]);

    useEffect(()=>{
        if (player && game && game.turnNumber) {
            const interval = setInterval(()=>{
                getGameInfo();
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [game, state.viewingMode]);

    const Loading = () => {
    
        return (<div>Loading...</div>)};
    
    const Error = () => {return (<><div>Something went wrong</div>{cd.errorMessage? <div>{cd.errorMessage}</div>:null}</>)};

    const Alert = () => {
        const alert = state.alert

        return (
            <div className="alert-screen">
                <div className="row my-5">
                    <div className="col-10 col-sm-8 col-md-6 col-lg-4 mx-auto bg-light p-3 border border-dark rounded">
                        {alert.message? <div className="text-center mb-2">{alert.message}</div>: null}
                        {alert.content? <div className="text-center mb-2">{alert.content()}</div>: null}
                        <div className="d-flex">
                            {alert.action? <div className="px-0 text-center ms-auto me-3"><button className="btn btn-danger" onClick={alert.action}>{alert.actionMessage}</button></div>: null}
                            <div className="px-0 text-center me-auto"><button className="btn btn-secondary" onClick={()=>setState({...state, alert:null})}>Back</button></div>
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
                        PlayGame(state, token, cd, player, game, civilizations, advCards, setState, setToken, setCD, setPlayer, setGame, setCivilizations, setAdvCards, history, setHistory)
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


