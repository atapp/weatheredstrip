import React from 'react';
import Clock from 'react-live-clock';
import moment from 'moment';

function Timestamp({
  dataTime
}) {
  return (
    <div className="timestamp">
      <div className="timestamp-names">
        <div>Data time:</div>
        <div>Current time:</div>
      </div>
      <div className="timestamp-time">
        <time>{ moment.utc(dataTime).format('YYYY-MM-DD[T]HH:mm:ss[Z]') }</time>
        <Clock format={ 'YYYY-MM-DD[T]HH:mm:ss[Z]' } ticking={ true } timezone={ 'UTC' } />
      </div>
    </div>
  )
}

export default Timestamp;
