import React from "react";
import axios from "axios";
import { render } from "react-dom";
// import { CheckSquare, PlusSquare, StopBtn, BarChartLine, SkipEndBtn, XCircle, BoxArrowRight, Backspace } from "react-bootstrap-icons";

const capitalize = (str) => str? str.charAt(0).toUpperCase() + str.slice(1): str;
const title = (str) => str.split(' ').map(capitalize).join(' ')
const sentance = (str) => str?.split('. ')?.map(capitalize).join('. ') || capitalize(str);

const colors = {'orange': '#ee8222',
'yellow': '#f7cb0d',
'red': '#ec232e',
'blue': '#0282CF',
'green': '#40b24c',}

const Info = (state, setState, advCards) => {

    const handleInfoMode = (mode) => {
        setState({...state, infoMode: mode});
    };

    const handleCardSelect = (render, card) => {
        const alert = {
            content: () => render(card)
        };
        setState({...state, alert: alert})
    };

    const calamities = state.calamities;

    const renderCalamityCard = (calamity, key) => {return(
        
        <div className="calamityCard" key={key}>
            <div className="levelCircle">{calamity.level}</div>
            <div className={calamity.major? 'majorCalamityCardTitle': 'minorCalamityCardTitle'}>{title(calamity.name)}</div>
            {calamity.tradable? null: <div className="nonTrable">Non Tradable</div>}
            <div className="calamityText">
                <p>{sentance(calamity.text)}</p>
                {calamity.modifiers.map((modifier, key)=><p key={key}><span className={modifier.pos? 'posModifier': 'negModifier'}></span>{sentance(modifier.text)}</p>)}
                <p><i>{sentance(calamity.additional)}</i></p>
            </div>
            {calamity.major? <div className="majorCalamity">Major Calamity</div>: <div className="minorCalamity">Minor Calamity</div>}
        </div>)};

    const renderAdvCard = (card, key) => {
        
        const pcolor = colors[card.pgroup];
        const scolor = card.sgroup? colors[card.sgroup]: pcolor;
        const titleColor = {backgroundImage: `linear-gradient(to right, ${pcolor}, ${scolor})`};
        const points = card.price < 100? 1: card.price < 200? 3: card.price? 6: 0;
        const subTexts = card.texts.split('#');
        const MainText = subTexts[0]? <p>{sentance(subTexts[0])}</p>: null;
        const parseSub = (sub, key) => <div key={key}><h6 className="my-0">{title(sub.split(': ')[0])}</h6><p>{sentance(sub.split(': ')[1])}</p></div>
        const CatTexts = () => <>{subTexts.slice(1).map(parseSub)}</>;
        const text = <>{MainText}{CatTexts()}</>;

        return (

            <div key={key} className="advCard">
                <div className="advTitle" style={titleColor}>{title(card.name)}</div>
                <div className="advPointsRow">
                    <div className="advCostCircle">{card.price}</div>
                    <div className="advPointsSqaure">{points}</div>
                </div>
                <div className="advBody">
                    <div className="advCreditsColumn">{Object.entries(card.credits).map(([group, credit], key)=>{return credit? <div key={key} style={{backgroundColor: colors[group]}} className="advCreditsCircle">{credit}</div>: null})}</div>
                    <div className="advTextColumn">
                        <div className="advText">{text}</div>
                        {card.creditTo? <div className="advCreditTo">{card.creditTo.amount} credits to {title(card.creditTo.name)}</div>:null}
                    </div>
                </div>
            </div>)};

    const Adv = () => {
        
        const query = state.infoQuery;
        const colors = state.infoColor;
        const sort = state.infoSort;
        const noColors = Object.values(colors).every(color=>!color);
        const advCardsP = advCards
        .filter(card=>
            (noColors||Object.entries(colors).reduce((any, [group, filter])=>{return any||(filter&&(card.pgroup===group||card.sgroup===group))},false)) && 
            (!query || card.name.includes(query) || (card.texts.includes(query))))
        .sort((card, otherCard)=>sort==='price'?card.price-otherCard.price:card.name.toUpperCase()<otherCard.name.toUpperCase()?-1:1)

        return (<div className="">
        <div className="row d-flex flex-row p-0 m-0">
            <div className="col-12 col-sm-7 me-auto p-0 m-0 mb-1 mb-sm-0">
                <div className="input-group">
                    <input className="form-control form-control-sm" type="text" id="query" placeholder="Search for Advancement" value={query} onChange={(event)=>setState({...state, infoQuery:event.target.value})}></input>
                    <span className="input-group-text">Sort:</span>
                    <input type="radio" className=" btn-check" name="btnradio" id="sort-by-name" autoComplete="off" checked={state.infoSort==='name'} onChange={()=>setState({...state, infoSort: 'name'})}/>
                    <label className="btn btn-secondary" htmlFor="sort-by-name">Name</label>
                    <input type="radio" className=" btn-check" name="btnradio" id="sort-by-price" autoComplete="off" checked={state.infoSort==='price'} onChange={()=>setState({...state, infoSort: 'price'})}/>
                    <label className="btn btn-secondary" htmlFor="sort-by-price">Price</label>
                </div>
            </div>
            <div className="col-12 col-sm-5 d-flex p-0 m-0">
                <div className="credit-filter p-0 m-0 ms-auto me-1">
                    <label  htmlFor="filter-blue">
                        <input type="checkbox" id="filter-blue" checked={state.infoColor.blue} onChange={()=>setState({...state, infoColor: {...state.infoColor, blue: !state.infoColor.blue}})}/>
                        <span className="blue"></span>
                    </label>
                </div>
                <div className="credit-filter p-0 m-0 me-1">
                    <label htmlFor="filter-green">
                        <input type="checkbox" id="filter-green" checked={state.infoColor.green} onChange={()=>setState({...state, infoColor: {...state.infoColor, green: !state.infoColor.green}})}/>
                        <span className="green"></span>
                    </label>
                </div>
                <div className="credit-filter p-0 m-0 me-1">
                    <label htmlFor="filter-red">
                        <input type="checkbox" id="filter-red" checked={state.infoColor.red} onChange={()=>setState({...state, infoColor: {...state.infoColor, red: !state.infoColor.red}})}/>
                        <span className="red"></span>
                    </label>
                </div>
                <div className="credit-filter  p-0 m-0 me-1">
                    <label htmlFor="filter-yellow">
                        <input type="checkbox" id="filter-yellow" checked={state.infoColor.yellow} onChange={()=>setState({...state, infoColor: {...state.infoColor, yellow: !state.infoColor.yellow}})}/>
                        <span className="yellow"></span>
                    </label>
                </div>
                <div className="credit-filter p-0 m-0">
                    <label htmlFor="filter-orange">
                        <input type="checkbox" id="filter-orange" checked={state.infoColor.orange} onChange={()=>setState({...state, infoColor: {...state.infoColor, orange: !state.infoColor.orange}})}/>
                        <span className="orange"></span>
                    </label>
                </div>
            </div>
        </div>
        <div className="row p-0 m-0" >{advCardsP? advCardsP.map((card, key)=><div key={key} className="col-6 col-sm-4 col-lg-3 p-1 m-0 cardInline" onClick={()=>handleCardSelect(renderAdvCard, card)}>{renderAdvCard(card, key)}</div>): null}</div>
    </div>)};

    const Cal = () => {
        
        const filter = state.infoFilter;
        const query = state.infoQuery;
        const calamityCards = state.calamities
        .filter(card=>(!query || card.name.includes(query) || (card.text.includes(query) || card.level===query || card.additional.includes(query))) || card.modifiers.filter(modifier=>modifier.text.includes(query)).length>0)
        .sort((card, otherCard)=>(card.level-otherCard.level)*10+(otherCard.major? (card.major? 0: 1): otherCard.tradable? (card.tradable? 0: 1): -1));

        return(<>
            <div className="col-12 col-md-6 m-0 p-0 mb-2">
                <input className="form-control form-control-sm" type="text" id="query" placeholder="Search for Calamity" value={query} onChange={(event)=>setState({...state, infoQuery:event.target.value})}></input>
            </div>
            <div className="row m-0 p-0" >{calamities? calamityCards.map((calamity, key)=><div key={key} className="col-6 col-sm-4 col-lg-3 p-1 m-0 cardInline" onClick={()=>handleCardSelect(renderCalamityCard, calamity)}>{renderCalamityCard(calamity, key)}</div>): null}</div>
        </>)};

    const Pop = () => {return (
        <div className="accordion" id="partsOfPlay">
        <div className="accordion-item">
            <h2 className="accordion-header" id="taxHeading">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTax" aria-expanded="false" aria-controls="collapseTax">
                    <h5>1. Tax Collection</h5>
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
                    <h5>2. Population Expansion</h5>
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
                    <h5>3. Movement</h5>
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
                    <h5>4. Conflict</h5>
                </button>
            </h2>
            <div id="collapseConflict" className="accordion-collapse collapse text-start" aria-labelledby="conflictHeader" data-bs-parent="#partsOfPlay">
                <div className="accordion-body">
                    <p>Order: <i>AST rank of defending player</i></p>
                    <p><strong></strong></p>
                </div>
            </div>
        </div>
        <div className="accordion-item">
            <h2 className="accordion-header" id="cityHeader">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseCity" aria-expanded="false" aria-controls="collapseCity">
                    <h5>5. Post Combat</h5>
                </button>
            </h2>
            <div id="collapseCity" className="accordion-collapse collapse text-start" aria-labelledby="cityHeader" data-bs-parent="#partsOfPlay">
                <div className="accordion-body">
                    <p>Order: <i>AST Rank</i></p>
                    <p><strong>5A. City Construction: </strong></p>
                    <p><strong>5B. Surplus Population Removal: </strong></p>
                    <p><strong>5C. City Support and Reduction: </strong></p>
                </div>
            </div>
        </div>
        <div className="accordion-item">
            <h2 className="accordion-header" id="acqHeader">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseAcq" aria-expanded="false" aria-controls="collapseAcq">
                    <h5>6. Trade Card Acquisition</h5>
                </button>
            </h2>
            <div id="collapseAcq" className="accordion-collapse collapse text-start" aria-labelledby="acqHeader" data-bs-parent="#partsOfPlay">
                <div className="accordion-body">
                    <p>Order: <i>Number of Cities (least to most), then AST</i></p>
                    <p><strong>6A. Drawing Trade Cards: </strong></p>
                    <p><strong>6B. Purchasing Additional Cards: </strong></p>
                </div>
            </div>
        </div>
        <div className="accordion-item">
            <h2 className="accordion-header" id="tradeHeader">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTrade" aria-expanded="false" aria-controls="collapseTrade">
                    <h5>7. Trade</h5>
                </button>
            </h2>
            <div id="collapseTrade" className="accordion-collapse collapse text-start" aria-labelledby="tradeHeader" data-bs-parent="#partsOfPlay">
                <div className="accordion-body">
                    <p>Order: <i>Simultaneous</i></p>
                    <p></p>
                </div>
            </div>
        </div>
        <div className="accordion-item">
            <h2 className="accordion-header" id="calamHeader">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseCalam" aria-expanded="false" aria-controls="collapseCalam">
                    <h5>8. Calamity Selection</h5>
                </button>
            </h2>
            <div id="collapseCalam" className="accordion-collapse collapse text-start" aria-labelledby="calamHeader" data-bs-parent="#partsOfPlay">
                <div className="accordion-body">
                    <p>Order: <i>Simultaneous</i></p>
                    <p></p>
                </div>
            </div>
        </div>
        <div className="accordion-item">
            <h2 className="accordion-header" id="resoHeader">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseReso" aria-expanded="false" aria-controls="collapseReso">
                    <h5>9. Calamity Resolution</h5>
                </button>
            </h2>
            <div id="collapseReso" className="accordion-collapse collapse text-start" aria-labelledby="resoHeader" data-bs-parent="#partsOfPlay">
                <div className="accordion-body">
                    <p>Order: <i>AST Rank</i></p>
                    <p><strong>9A. Minor Calamities: </strong></p>
                    <p><strong>9B. Major Calamities: </strong></p>
                </div>
            </div>
        </div>
        <div className="accordion-item">
            <h2 className="accordion-header" id="saHeader">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSA" aria-expanded="false" aria-controls="collapseSA">
                    <h5>10. Special Abilities</h5>
                </button>
            </h2>
            <div id="collapseSA" className="accordion-collapse collapse text-start" aria-labelledby="saHeader" data-bs-parent="#partsOfPlay">
                <div className="accordion-body">
                    <p>Order: <i>AST Position, then AST Rank</i></p>
                    <p></p>
                </div>
            </div>
        </div>
        <div className="accordion-item">
            <h2 className="accordion-header" id="surplusHeader">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSurplus" aria-expanded="false" aria-controls="collapseSurplus">
                    <h5>11. Remove Surplus Population</h5>
                </button>
            </h2>
            <div id="collapseSurplus" className="accordion-collapse collapse text-start" aria-labelledby="surplusHeader" data-bs-parent="#partsOfPlay">
                <div className="accordion-body">
                    <p>Order: <i>Simultaneous</i></p>
                    <p></p>
                </div>
            </div>
        </div>
        <div className="accordion-item">
            <h2 className="accordion-header" id="purhaseHeader">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapsePurchase" aria-expanded="false" aria-controls="collapsePurchase">
                    <h5>12. Purcahse Civilization Advancements</h5>
                </button>
            </h2>
            <div id="collapsePurchase" className="accordion-collapse collapse text-start" aria-labelledby="purhaseHeader" data-bs-parent="#partsOfPlay">
                <div className="accordion-body">
                    <p>Order: <i>AST Position, then AST Rank</i></p>
                    <p></p>
                </div>
            </div>
        </div>
        <div className="accordion-item">
            <h2 className="accordion-header" id="astHeader">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseAst" aria-expanded="false" aria-controls="collapseAst">
                    <h5>13. AST-Alteration</h5>
                </button>
            </h2>
            <div id="collapseAst" className="accordion-collapse collapse text-start" aria-labelledby="astHeader" data-bs-parent="#partsOfPlay">
                <div className="accordion-body">
                    <p>Order: <i>AST Rank</i></p>
                    <p><strong>13A. Succession Markers: </strong></p>
                    <p><strong>13B. Check For Game End: </strong></p>
                    <p><strong>13C. Reshuffle Trade Cards: </strong></p>
                </div>
            </div>
        </div>
    </div>)};

    return (<div className="my-2">
        <div className="d-flex mb-2 btn-group" role="group">
            <div className="">
                <input type="radio" className="btn-check" id="pop" name="btnradio" checked={state.infoMode==='pop'} onChange={()=>handleInfoMode('pop')}/>
                <label className="btn btn-outline-dark" htmlFor="pop">Rules</label>
            </div>
            <div className="ms-1">
                <input type="radio" className="btn-check" id="cal" name="btnradio" checked={state.infoMode==='cal'} onChange={()=>handleInfoMode('cal')}/>
                <label className="btn btn-outline-dark" htmlFor="cal">Calamities</label>
            </div>
            <div className="ms-1">
                <input type="radio" className="btn-check" id="adv" name="btnradio" checked={state.infoMode==='adv'} onChange={()=>handleInfoMode('adv')}/>
                <label className="btn btn-outline-dark" htmlFor="adv">Advancements</label>
            </div>
        </div>
        {state.infoMode==='cal'?
            Cal()
        :state.infoMode==='adv'?
            Adv()
        :Pop()}
    </div>);};

export default Info;
