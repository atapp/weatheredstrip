import React from 'react';

function StationNav({
  data,
  selected,
  onClick,
}) {
  if (data) {
    const stations = Object.keys(data).filter(title => title !== 'other_notam' && title !== 'Timestamp').map(airport => {
      const divClass = (selected === airport ? 'station station-selected' : 'station');
      return <button className={ divClass } key={ airport } onClick={ () => onClick(airport) }>{ airport }</button>
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
