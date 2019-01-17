import React from 'react';

function Tafs({
  data,
}) {
  let tafs;

  if (data) {
    tafs = data.map((taf, index) => {
      return (<div className="NotifText" key={ index }>{ taf }</div>)
    })
  }

  return (
    <div className="tafs">{tafs}</div>
  )
}

export default Tafs;
