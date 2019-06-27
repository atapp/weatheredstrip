import React from 'react';

function Tafs({
  data,
}) {
  let tafs;

  if (data && data.length > 0) {
    tafs = data.map((taf, index) => {
      return (<div className="notif-text" key={ index }>{ taf }</div>)
    })
  } else {
    tafs = <div>No TAF is issued for this station.</div>
  }

  return (
    <div className="tafs">{tafs}</div>
  )
}

export default Tafs;
