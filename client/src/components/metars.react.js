import React, { Component } from 'react';

function Metars({
  children,
  className,
  data,
}) {
  let metars;

  if (data) {
    metars = data.map((metar, index) => {
      return (<div key={index}>{metar}</div>)
    })
  }

  console.log(metars)
  return (
    <div className="Metars NotifText">{metars}</div>
  )
}

export default Metars;
