import React from 'react';

function Rvr({
  data,
}) {
  return ( data ?
      <img id="RVR" src={ data } alt="Aerodrome Chart"/> : null
  )
}

export default Rvr;
