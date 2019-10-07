import React from 'react';

function Metars({
  children,
  className,
  data,
}) {
  let metars;

  if (data && data.length > 0) {
    metars = data.map((metar, index) => {
      return (<div className="notif-text" key={ index }>{ metar.text }</div>)
    })
  } else {
    metars = <div>No METAR is issued for this station.</div>
  }

  return (
    <div className="Metars">{metars}</div>
  )
}

export default Metars;
