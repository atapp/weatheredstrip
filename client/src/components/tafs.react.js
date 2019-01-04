import React, { Component } from 'react';

function Tafs({
  children,
  className,
  data,
}) {
  return (
    <div className="Tafs NotifText">{data}</div>
  )
}

export default Tafs;
