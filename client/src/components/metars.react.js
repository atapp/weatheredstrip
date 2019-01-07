import React from 'react';

function Metars({
  children,
  className,
  data,
}) {
  let metars;

  if (data) {
    metars = data.map((metar, index) => {
      return (<div className="NotifText" key={index}>{metar}</div>)
    })
  }

  return (
    <div className="Metars">{metars}</div>
  )
}

export default Metars;
