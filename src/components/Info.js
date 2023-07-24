import React from "react";
import axios from "axios";
import { CheckSquare, PlusSquare, StopBtn, BarChartLine, SkipEndBtn, XCircle, BoxArrowRight, Backspace } from "react-bootstrap-icons";


const Info = () => {

    return (<div className="my-2">
        <div className="accordion" id="partsOfPlay">
            <div className="accordion-item">
                <h2 className="accordion-header" id="taxHeading">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTax" aria-expanded="false" aria-controls="collapseTax">
                        1. Tax Collection
                    </button>
                </h2>
                <div id="collapseTax" className="accordion-collapse collapse text-start" aria-labelledby="taxHeading" data-bs-parent="#partsOfPlay">
                    <div className="accordion-body">
                        <p>Order: <i>Simultaneous</i></p>
                        <p><strong>1A. Tax Collection: </strong>All players must transfer a number of population tokens from stock to treasury equal to their tax rate for each of their cities on the map board. The default tax rate is 2, but this can be adjusted by Civilization Advances. Players cannot choose to refrain from collecting tax.</p>
                        <p><strong>1B. Tax Revolts: </strong>If 1 or more players do not have sufficient stock to collect their taxes, revolts occur. All other players finish tax collection. Then players with insufficient tokens in stock move all of their stock tokens to treasury. For each city that this player can not fully collect tax for, the beneficiary may choose and annex 1 of their cities. This beneficiary does not collect taxes this turn for any cities gained this way. If the beneficiary does not have sufficient cities a next beneficiary is selected. If all players have 9 cities, remaining cities are destroyed instead.</p>
                    </div>
                </div>
            </div>
            <div className="accordion-item">
                <h2 className="accordion-header" id="population">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapsePopulation" aria-expanded="false" aria-controls="collapsePopulation">
                        2. Population Expansion
                    </button>
                </h2>
                <div id="collapsePopulation" className="accordion-collapse collapse text-start" aria-labelledby="population" data-bs-parent="#partsOfPlay">
                    <div className="accordion-body">
                        <p>Order: <i>Simultaneous</i></p>
                        <p><strong>2A. Population Expansion: </strong>Each player places population tokens from stock in each area containing tokens according to the following: 1 token in each area containing 1 of their tokens and 2 tokens in all areas containing 2 or more of their tokens.</p>
                        <p>If a player does not have sufficient tokens in stock to complete expansion, the player may choose where to add available tokens while still following above expansion rules. Players may not choose to expand fewer tokens than possible. Expansion does not count as combat. Barbarians do not expand.</p>
                        <p><strong>2B. Census: </strong>After completing all expansion, all players count their tokens on the board and adjust their census markers accordingly. Cities and ships do not count as population.</p>
                    </div>
                </div>
            </div>
            <div className="accordion-item">
                <h2 className="accordion-header" id="movementHeader">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseMovement" aria-expanded="false" aria-controls="collapseMovement">
                        3. Movement
                    </button>
                </h2>
                <div id="collapseMovement" className="accordion-collapse collapse text-start" aria-labelledby="movementHeader" data-bs-parent="#partsOfPlay">
                    <div className="accordion-body">
                        <p>Order: <i>Census (largest to smallest)</i></p>
                        <p><strong>3. Movement: </strong> Players may move each of their tokens on the board either 1 step to an area adjacent by land or onto a ship and may move each of their ships 4 steps.</p>
                        <p><strong>Ship Construction: </strong>At any time during a players movemnet phase trun, that player may choose to construct ships. This can only be done in coastal areas containing 1 or more of his tokens. A player can have no more than 4 ships at any time. Constructing a ship costs 2 tokens which can be paid for by using treasury and/or by destroying tokens from the same area as the ship. Ships may be used the turn they are built.</p>
                        <p><strong>Ship Maitenance: </strong>As soon as a player wants to use a ship that was built on a differenet turn, they must either pay 1 treasury token or destroy 1 of their tokens from anywhere on the board to maintain the ship. This must be done for each ship the player wished to use and can be done for ships the player does not wish to use this turn. Any ships not maintained are destroyed at the end of the players movement phase turn.</p>
                        <p><strong>Ship Movement: </strong>Players may move each of their ships a maximum of 4 areas by water per turn. By default, ships cannot be moved through open sea areas. At any time during the ship's movement, the ship may embark or disambark any number of tokens, but the ship can not carry more than the carrying capacity. The default carrying capacity is 5. At the ships final destination, all tokens automatically disembark in that area. Tokens may move by land or by ship but not both. By default, ships do not engage in conflict or block the mmovement of other ships.</p>
                    </div>
                </div>
            </div>
            <div className="accordion-item">
                <h2 className="accordion-header" id="conflictHeader">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseConflict" aria-expanded="false" aria-controls="collapseConflict">
                        3. Conflict
                    </button>
                </h2>
                <div id="collapseConflict" className="accordion-collapse collapse text-start" aria-labelledby="conflictHeader" data-bs-parent="#partsOfPlay">
                    <div className="accordion-body">
                        <p>Order: <i>All Token Conflicts simultaneously, then all City Conflicts by defending player AST rank</i></p>
                        <p><strong></strong></p>
                    </div>
                </div>
            </div>
        </div>
    </div>);
};

export default Info;
