import React from 'react';
import { render, cleanup } from '@testing-library/react'
import Rvr from '../rvr.react';
import 'jest-dom/extend-expect';
afterEach(cleanup)

it('Rvr renders properly', () => {
  const rvr = 'http://atm.navcanada.ca/images/iwv/CYMX.png'

  const { container } = render(<Rvr data={ rvr }/>)
  const renderedRvr = container.firstChild
  expect(renderedRvr).toMatchSnapshot()
});

it('empty Rvr renders null', () => {
  const rvr = null
  const { container } = render(<Rvr data={ rvr }/>)
  const renderedRvr = container.firstChild
  expect(renderedRvr).toBeNull()

})
