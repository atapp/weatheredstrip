import React, { Component } from 'react';

function StationNav({
  children,
  className,
  data,
  selected,
  onClick,
}) {
  const stations = data.map((airport, index) => {
    const divClass = (selected === index ? "Station Selected" : "Station");
    return <div className={divClass} key={index} onClick={() => onClick(index)}>{airport.Station}</div>
  })
  return (<div className="Selector">stations</div>)
}

export default StationNav;
