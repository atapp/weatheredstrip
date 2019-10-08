import React from 'react';

function Tafs({
  data,
}) {
  let tafs;
  let textData = null
  if (data && data.text && data.text.length > 0) {
    textData = data.text
  }

  if (textData && textData.length > 0) {
    tafs = textData.map((taf, index) => {
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
