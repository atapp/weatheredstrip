import React from 'react';

function Rvr({
  data,
}) {
  return ( data ?
    <img id="RVR" height="300" width="300" src={data} alt="Aerodrome Chart"/> : null
  )
}

export default Rvr;
