import React, { Component } from 'react';

function Notams({
  children,
  className,
  data,
}) {
  let notams;

  if (data) {
    notams = data.map((notam, index) => {
      return (<div key={index}>{notam}</div>)
    })
  }

  console.log(notams)
  return (
    <div className="Notams NotifText">{notams}</div>
  )
}

export default Notams;
