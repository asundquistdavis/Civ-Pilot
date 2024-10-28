import React, { useState } from 'react';
import Plot from 'react-plotly.js';


const capitalize = (str) => {return str? str.charAt(0).toUpperCase() + str.slice(1): str;};
const title = (str) => {return str.split(' ').map(capitalize).join(' ');}
const sentance = (str) => {return str?.split('. ')?.map(capitalize).join('. ') || capitalize(str);};

class History extends React.Component {

    constructor(props) {
        super(props);
        this.state = props.state
    };

    render() {

        const yaxis = {score:'Player Score (Victory Points)', census:'Population (tokens)', cities:'Number of Citis', astPosition:'AST Position', advCards:'Number of Advancement Cards',} 
        const turns = this.state.history? this.state.history.turns.map(turn=>turn.turnNumber): [];
        const playerdata = (mode) => this.state?.history?.turns?.[0]? this.state.history.turns?.[0].players.map((player, index)=>{
            return {
                x: turns,
                y: mode==='advCards'? this.state.history.turns.map(turn=>turn.players[index]['advCards'].length): this.state.history.turns.map(turn=>turn.players[index][mode]),
                type: 'scatter',
                mode:'lines',
                line: {width: 5},
                marker: {color: player.color, },
                name: capitalize(player.username),
            };
            }):[];
        const width = Math.min(window.innerWidth, 500) - 50;
        const leftMargin = 50;
        const layout = { 
            plot_bgcolor:"#b3b3bd",
            paper_bgcolor:'#f8f9fa',
            autosize:false,
            width, 
            height:width, 
            automargin: true,
            xaxis:{title:{text:'Turn Number'}},
            yaxis:{title:{text:yaxis[this.state.state.graphMode]}},
            margin: {
                t: 25,
                l: leftMargin,
                b: 30,
            }
        }

    };
};

export default History;
