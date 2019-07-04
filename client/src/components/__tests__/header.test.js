import React from 'react';
import { render, cleanup } from '@testing-library/react'
import Header from '../header.react';
import {Router} from 'react-router-dom'
import {createMemoryHistory} from 'history'
import 'jest-dom/extend-expect';
afterEach(cleanup)

function renderWithRouter(
  ui,
  {route = '/', history = createMemoryHistory({initialEntries: [route]})} = {},
) {
  return {
    ...render(<Router history={history}>{ui}</Router>),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history,
  }
}

it('header renders properly', () => {
  const { container } = renderWithRouter(<Header />)
  const header = container.firstChild
  expect(header).toMatchSnapshot()
})
