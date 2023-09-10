import React from "react";

const Scoreboard = (props) => {

    const { state, setState } = props;

    const playerInfos = () => {

        const playersSorted = state.game.players;

        return (
            <div>
                <div className="row d-flex m-0 p-0 flex-row">
                    <div className="col"></div>
                    <div className="col">Player</div>
                    <div className="col">Census</div>
                    <div className="col">Cities</div>
                    <div className="col">Cards</div>
                    <div className="col">AST</div>
                    <div className="col">Points</div>
                </div>
                {playersSorted.map(playerInfo)}
            </div>
        );
    };

    const playerInfo = (key, player) => {

        return (
            <div key={key} className="row d-flex flex-row m-0 p-0">
                <div className="col"></div>
                <div className="col">Player</div>
                <div className="col">Census</div>
                <div className="col">Cities</div>
                <div className="col">Cards</div>
                <div className="col">AST</div>
                <div className="col">Points</div>
            </div>
        );
    };

    return (<div>
        {playerInfos}
    </div>);
};

export default Scoreboard;
