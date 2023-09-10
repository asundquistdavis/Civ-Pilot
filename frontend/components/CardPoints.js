import React from "react";

const CardPoints = (props) => {
    const { width, height, aspectRatio, points } = props;
    const _aspectDim = width > height? height: width;
    const _aspectRatio = aspectRatio || 5/7;
    const _clip = _aspectDim/8;
    const _cardHeight = _aspectDim - _clip;
    const _cardWidth = _cardHeight * _aspectRatio;
    const _cardOffestX = (_aspectDim-_cardWidth)/2;
    const _cardOffestY = _clip; 
    const _cardRadius = _aspectDim/20;
    const _textCenterX = _cardOffestX+.5*_cardWidth-.5*_cardHeight*Math.sin(10*(Math.PI/180));
    const _textCenterY = _cardOffestY+.5*_cardHeight;

    return (
        <svg width={width} height={height}>
            <rect width={_cardWidth} height={_cardHeight} x={_cardOffestX} y={_cardOffestY} rx={_cardRadius} ry={_cardRadius} transform={`rotate(10, ${_cardOffestX+_cardWidth}, ${_aspectDim})`} style={{fill:'#666666', stroke:'black', strokeWidth: 1}}/>
            <rect width={_cardWidth} height={_cardHeight} x={_cardOffestX} y={_cardOffestY} rx={_cardRadius} ry={_cardRadius} style={{fill:'#999999', stroke:'black', strokeWidth: 1}}/>
            <rect id='card' width={_cardWidth} height={_cardHeight} x={_cardOffestX} y={_cardOffestY} rx={_cardRadius} ry={_cardRadius} transform={`rotate(-10, ${_cardOffestX}, ${_aspectDim})`} style={{fill:'#cccccc', stroke:'black', strokeWidth: 1}}/>
            <text x={_textCenterX} y={_textCenterY} fontSize={.6*_cardHeight} dominantBaseline="middle" textAnchor="middle">{points}</text>
        </svg>
    )
}

export default CardPoints;
