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

const Info = (state, setState, advCards, rules, calamities) => {

    const handleCardSelect = (render, card) => {
        const alert = {
            content: () => render(card)
        };
        setState({...state, alert: alert})
    };

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
        
        const query = state.infoQuery.toLowerCase();
        const colors = state.infoColor;
        const sort = state.infoSort;
        const noColors = colors? Object.values(colors).every(color=>!color): false;
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
                    <input type="radio" className=" btn-check" name="btnradio" id="sort-by-name" autoComplete="off" checked={state.infoSort==='name'} onChange={()=>setState({...state, infoSort: 'name', infoMode:'adv'})}/>
                    <label className="btn btn-secondary" htmlFor="sort-by-name">Name</label>
                    <input type="radio" className=" btn-check" name="btnradio" id="sort-by-price" autoComplete="off" checked={state.infoSort==='price'} onChange={()=>setState({...state, infoSort: 'price', infoMode:'adv'})}/>
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
        
        const query = state.infoQuery.toLowerCase();
        const calamityCards = calamities?.filter(
            card=>(!query || card.name.includes(query) || (card.text.includes(query) || card.level===query || card.additional.includes(query))) || card.modifiers.filter(modifier=>modifier.text.includes(query)).length>0)
        .sort((card, otherCard)=>(card.level-otherCard.level)*10+(otherCard.major? (card.major? 0: 1): otherCard.tradable? (card.tradable? 0: 1): -1));

        return(<>
            <div className="col-12 col-md-6 m-0 p-0 mb-2">
                <input className="form-control form-control-sm" type="text" id="query" placeholder="Search for Calamity" value={query} onChange={(event)=>setState({...state, infoQuery:event.target.value})}></input>
            </div>
            <div className="row m-0 p-0" >{calamities? calamityCards.map((calamity, key)=><div key={key} className="col-6 col-sm-4 col-lg-3 p-1 m-0 cardInline" onClick={()=>handleCardSelect(renderCalamityCard, calamity)}>{renderCalamityCard(calamity, key)}</div>): null}</div>
        </>)};

    const Pop = () => {
        const parent = 'partsOfPlay';

        const renderPop = (phase, key) => {

            const titleText = title(phase.title);
            const renderSubphase = (subphase, key) => <div key={key}>
                <h5>{title(subphase.subtitle)}</h5>
                <p><i>Order: {subphase.order}</i></p>
                <p>{sentance(subphase.text)}</p>
            </div>
            const header = 'header'+phase.number;
            const body = 'body'+phase.number;
            return(<div className="accordion-item" key={key}>
                <h2 className="accordion-header"  id={header}>
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={'#'+body}>
                        <h5>{titleText}</h5>
                    </button>
                </h2>
                <div className="accordion-collapse collapse text-start" id={body} data-bs-parent={'#'+parent}>
                    <div className="accordion-body">
                        {phase.texts.map(renderSubphase)}
                    </div>
                </div>

            </div>)
        }

        return (
            <div className="accordion" id={parent}>
                {rules?.map(renderPop)}    
            </div>)
    }

    return (<div className="my-2">
        <div className="row flex-row d-flex m-0 p-0 mb-2">
            <input type="checkbox" className="btn-check" id="pop" checked={state.infoMode==='pop'} onChange={()=>setState({...state, infoMode: 'pop'})}/>
            <label className="col btn btn-outline-dark me-1" htmlFor="pop">Rules</label>
            <input type="checkbox" className="btn-check" id="cal" checked={state.infoMode==='cal'} onChange={()=>setState({...state, infoMode: 'cal'})}/>
            <label className="col btn btn-outline-dark me-1" htmlFor="cal">Calamities</label>    
            <input type="checkbox" className="btn-check" id="adv" checked={state.infoMode==='adv'} onChange={()=>setState({...state, infoMode: 'adv'})}/>
            <label className="col btn btn-outline-dark me-auto" htmlFor="adv">Advancements</label>
        </div>
        {state.infoMode==='cal'?
            Cal()
        :state.infoMode==='adv'?
            Adv()
        :Pop()}
    </div>);};

export default Info;
