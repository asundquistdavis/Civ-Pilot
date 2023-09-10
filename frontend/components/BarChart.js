import React from "react";
import { capatalize } from "../utilities";

const BarChart = (props) => {

    const { width, height, data, pillWidth } = props;
    const _barsData = data.bars;
    const _dimX = data.meta.numberOfTurns;
    const _dimY = data.meta.numberOfCivilizations;
    const _colors = data.meta.civilizationsInfo.colors;
    const _usernames = data.meta.civilizationsInfo.usernames;
    const _civilizations = data.meta.civilizationsInfo.civilizations;
    const _maxBarValue = _barsData.map(barData=>barData.reduce((partial, cellData)=>partial + cellData, 0)).reduce((p, c)=>c>p?c:p, 0);
    const _pillWidth = pillWidth||90;
    const _pillsPerRowT = Math.floor(width/_pillWidth);
    const _numberOfRows = Math.ceil(_dimY/_pillsPerRowT);
    const _pillsPerRowA = Math.ceil(_dimY/_numberOfRows);
    const _rowWidth = _pillsPerRowA*_pillWidth;
    const _paddingT = 25+25*_numberOfRows;
    const _paddingB = 0;
    const _paddingY = _paddingT+_paddingB;
    const _paddingR = 0;
    const _paddingL = 0;
    const _paddingX = _paddingL+_paddingR;
    const _barBlock = (width-_paddingX)/_dimX
    const _barSpacing = .1*_barBlock;
    const _barScale = (height-_paddingY-_barSpacing)/_maxBarValue;
    const _barWidth = _barBlock-_barSpacing;

    
    const cell = (_turnN, _traceN, _cellData, _partialTotal, _barGapY) => {
        const _cellHeight = _cellData*_barScale;
        const _x = _paddingL+_barSpacing+(_turnN*_barBlock);
        const _y = _paddingT+(_partialTotal+_barGapY)*_barScale;
        return <rect key={_traceN} width={_barWidth} height={_cellHeight} x={_x} y={_y} fill={_colors[_traceN]}>
            <title>
                {_cellData}
            </title>
        </rect>
    }

    const bar = (_turnN, _barData) => {
        const _partialTotals = _barData.slice().reduce((p, c, i)=> p.concat(c+p[i]), [0]).slice()
        const _barGapY = _maxBarValue-_partialTotals[_partialTotals.length-1]
        return _barData.map((_cellData, _traceN)=>cell(_turnN, _traceN, _cellData, _partialTotals[_traceN], _barGapY));
    };

    const bars = _barsData.map((_barData, _turnN)=>bar(_turnN, _barData));

    return (
        <svg width={width} height={height}>
            <text x={width/2} y={20} textAnchor="middle" fontSize={20}>hello</text>
            {_colors.map((_color, _traceN)=><rect key={_traceN} width={_pillWidth} height={25} x={(width-_rowWidth)/2+_traceN%_pillsPerRowA*_pillWidth} y={25} fill={_color}></rect>)}
            {_usernames.map((_username, _traceN)=><text x={(width-_rowWidth)/2+_pillWidth/2+_traceN%_pillsPerRowA*_pillWidth} y={45} textAnchor="middle" fill="black">{capatalize(_username)}</text>)}
            {bars}
        </svg>
    );
};

export default BarChart;
