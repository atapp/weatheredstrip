import React from 'react'
import { withRouter } from 'react-router'

const LinkButton = (props) => {
  const {
    history,
    location,
    match,
    staticContext,
    to,
    onClick,
    // ⬆ filtering out props that `button` doesn’t know what to do with.
    ...rest
  } = props
  return (
    <button
      { ...rest } // `children` is just another prop!
      onClick={ (event) => {
        history.push(to)
        onClick && onClick(event)
      } }
    />
  )
}

export default withRouter(LinkButton)
