import React, { useEffect, useState, use } from "react";
import Auth from "./Auth";
import NewGame from "./NewGame";
import PlayGame from "./PlayGame";
import axios from "axios";
import { param } from "jquery";
import { compileString } from "sass";

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
        isFilterOn: false,
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
                setCD({...cd, errorMessage: error.response.data.message});
                if (cd.errorMessage === 'invalid credentials') {
                    localStorage.clear()
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
        .catch(error=>setCD({...cd, errorMessage: error.response.data.message}));
    };

    const getAdvCards = () => {
        axios.get('api/advcards')
        .then(response=>setAdvCards(response.data.advCards))
        .catch(error=>setCD({...cd, errorMessage: error.response.data.message}));
    };

    useEffect(()=>{
        getPlayerInfo();
    }, [token]);

    useEffect(()=>{
        getGameInfo();
    }, [player]);

    useEffect(()=>{
        getAdvCards();
        getCivilizations();
    }, [game]);

    useEffect(()=>{
        if (cd.hostName) {
            getUsernames()
            const targetHost = usernames.filter(user=>user.username===cd.hostName).length>0
            console.log(targetHost)
            targetHost? setState({...state, isValidGame: true}):null;
        }
    }, [cd.hostName]);

    const Loading = () => {
    
        return (<div>Loading...</div>)};
    
    const Error = () => {return (<div>Something went wrong</div>)};

    return (
        <div className="container mt-3">
            <div className="row">
                <div className="col-sm-12 col-lg-8 mx-auto text-center bg-light rounded border border-dark">
                    {!token?
                        Auth(state, token, cd, setState, setToken, setCD)
                    :(player && (!game || (game && !game.turnNumber)))?
                        NewGame(state, token, cd, player, game, civilizations, advCards, setState, setToken, setCD, setPlayer, setGame, setCivilizations, setAdvCards, usernames, setUsernames)
                    :(game && game.turnNumber)?
                        PlayGame(state, token, cd, player, game, civilizations, advCards, setState, setToken, setCD, setPlayer, setGame, setCivilizations, setAdvCards)
                    :Error()}
                </div>
            </div>
        </div>
    );
};

export default App;


