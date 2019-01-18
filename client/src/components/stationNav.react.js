import React from 'react';

function StationNav({
  children,
  className,
  data,
  selected,
  onClick,
  sticky,
}) {
  const classname = sticky ? 'sticky' : null
  const stations = data.map((airport, index) => {
    const divClass = (selected === index ? 'station station-selected' : 'station');
    return <div className={ divClass } key={ index } onClick={ () => onClick(index) }>{ airport.Station }</div>
  })
  return (
    <div id="navbar" className={ classname }>
      <div className="navbar-content">{ stations }</div>
    </div>
  )
}

export default StationNav;
