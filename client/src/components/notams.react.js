import React from 'react';

function Notams({
  children,
  className,
  data,
}) {
  let notams;

  if (data) {
    notams = data.map((notam, index) => {
      return (
        <div className="notif-text" key={ index }>
          <div><strong>{notam.title}</strong></div>
          <div>{notam.notam}</div>
        </div>
      )
    })
  }

  return (
    <div className="Notams">{notams}</div>
  )
}

export default Notams;
