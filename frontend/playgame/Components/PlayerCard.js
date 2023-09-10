import React from "react";
import Header from "../../components/Header";
import { capatalize } from "../../utilities";
import SubHeader from "../../components/SubHeader";
import './playercard.scss'
import CardPoints from "../../components/CardPoints";

const PlayerCard = (props) => {

    const { key, player, state, setState } = props;

    const census = <div className="censusSquare">{player.census}</div>

    const cities = <div className="citiesCircle">{player.cities}</div>

    return (
        <div 
            key={key}
            className='border border-dark'
            // style={{backgroundColor: player.color, width: 300}}
            >    
            <Header className='p-0 m-0' buttonL={census} text={capatalize(player.username)} subT={capatalize(player.civilization)} buttonR={cities}/>
        </div>
    );
};

export default PlayerCard;
