import React from 'react';

function Notams({
  children,
  className,
  data,
  selectedType,
  onTypeSelection,
  dataLength
}) {
  let notams;
  const types = [
    'Aerodrome',
    'FIR',
    'GPS'
  ]

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

  const typesFormated = types.map((type, index) => {
    let className;
    let isDisabled = false
    if (dataLength && !dataLength[ type ] ) {
      isDisabled = true
    }
    if (selectedType) {
      if (type === selectedType) {
        className = 'button primary'
      } else {
        className = 'button secondary'
      }
    } else {
      if (index === 0) {
        className = 'button primary'
      } else {
        className = 'button secondary'
      }
    }

    return (
      <button
        disabled={ isDisabled }
        className={ className }
        onClick={ () => onTypeSelection(type) }
        key={ type }>
        {`${ type } (${ dataLength && dataLength[ type ] ? dataLength[ type ] : null })`}
      </button>
    )

  })

  return (
    <div className="col">
      <div id="notam-header">
        <div className="subtitle">NOTAM</div>
        <div className="button-selection">
          {typesFormated}
        </div>
      </div>
      <div className="Notams">{notams}</div>
    </div>
  )
}

export default Notams;
