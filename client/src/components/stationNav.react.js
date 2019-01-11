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
    const divClass = (selected === index ? 'Station Selected' : 'Station');
    return <div className={ divClass } key={ index } onClick={ () => onClick(index) }>{ airport.Station }</div>
  })
  return (<div id="navbar" className={ classname }>{ stations }</div>)
}

export default StationNav;
