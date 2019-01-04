import React, { Component } from 'react';

function Notams({
  children,
  className,
  data,
}) {
  let notams;

  if (data) {
    notams = data.map((notam, index) => {
      return (<div className="NotifText" key={index}>{notam}</div>)
    })
  }

  return (
    <div className="Notams">{notams}</div>
  )
}

export default Notams;
