import React from 'react';

function StationNav({
  data,
  selected,
  onClick,
}) {
  if (data) {
    const stations = data.map((airport, index) => {
      const divClass = (selected === index ? 'station station-selected' : 'station');
      return <div className={ divClass } key={ index } onClick={ () => onClick(index) }>{ airport.Station }</div>
    })
    return (
      <div id="navbar">
        <div className="navbar-content">{ stations }</div>
      </div>
    )
  } else {
    return <div id="navbar"/>
  }
}

export default StationNav;
