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
        console.log(this.state.history);
        const playerdata = (mode) => this.state.history? this.state.history.turns?.[0].players.map((player, index)=>{
            return {
                x: turns,
                y: mode==='advCards'? this.state.history.turns.map(turn=>turn.players[index]['advCards'].length): this.state.history.turns.map(turn=>turn.players[index][mode]),
                type: 'scatter',
                mode:'lines',
                line: {width: 5, shape:'spline'},
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
        return (
            <div className='row'>
                <div className='col-12'>
                    <div className='row'>
                        <div className='col-6 col-md-4 mx-auto my-2'>
                            <select className='form-select text-center' onChange={(event) => this.setState({...this.state, state: {...this.state.state, graphMode: event.target.value}})}>
                                <option value={'score'}>Score</option>
                                <option value={'cities'}>Cities</option>
                                <option value={'census'}>Census</option>
                                <option value={'astPosition'}>AST Position</option>
                                <option value={'advCards'}>Advancement Cards</option>

                            </select>
                        </div>
                    </div> 
                    <Plot
                        data={playerdata(this.state.state.graphMode)}
                        layout={layout}
                    />
                </div>
            </div>
        );
    };
};

export default History;
