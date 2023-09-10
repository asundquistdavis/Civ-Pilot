import React from "react";

const HistoryChart = (props) => {

    const { width, height, data } = props;
    const _dimX = data.meta.numberOfTurns;
    const _dimY = data.meta.numberOfCivilizations;
    const _colors = data.meta.civilizationsInfo.colors;
    const _usernames = data.meta.civilizationsInfo.usernames;
    const _civilizations = data.meta.civilizationsInfo.civilizations;
    const _barsData = data.bars // [[trun1_civ1, trun1_civ2, trun1_civ3, ...], [trun2_civ1, trun2_civ2, trun2_civ3, ...], [trun3_civ1, trun3_civ2, trun3_civ3]]
    const _aspectRatio = width/height;
    const _paddingX = 0;
    const _paddingY = 0;
    const _barWidth = (width - _paddingX)/_dimX;
    const _barHeight = (height - _paddingY);
    // console.log(width);
    
    const cell = (_turnN, _civN, _value, _total, _partialTotal) => {
        console.log(_value);
        return (
            <rect key={_civN} width={_barWidth} height={_value/_total*_barHeight} x={_turnN*_barWidth} y={_barHeight*(1-_partialTotal/_total)} style={{fill: _colors[_civN]}}>
                <title>{_usernames[_civN]}</title>
            </rect>
        );
    };

    const bar = (_barData, _turnN) => {
        const _total = _barData.reduce((total, current)=>total+current, 0);
        console.log(_total);
        const _partialTotals = _barData.reduce((partialTotals, currentTotal, index)=>{partialTotals.push(currentTotal+partialTotals[index]); return partialTotals}, [0]).slice(1);
        return _barData.map((_value, _civN)=>cell(_turnN, _civN, _value, _total, _partialTotals[_civN]));
    };
    
    const _bars = _barsData.map((_turnN, _barData)=>bar(_turnN, _barData));

    return (
        <svg 
        width={width}
        height={height}>
            {_bars}
        </svg>
    );
};

export default HistoryChart;