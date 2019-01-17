import React from 'react';
import { render, cleanup } from 'react-testing-library'
import ReactDOM from 'react-dom';
import Rvr from '../rvr.react';
import moment from 'moment';
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
