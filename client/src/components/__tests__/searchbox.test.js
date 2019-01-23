import React from 'react';
import { render, cleanup } from 'react-testing-library'
import ReactDOM from 'react-dom';
import Searchbox from '../searchbox.react';
import 'jest-dom/extend-expect';
import { BrowserRouter } from 'react-router-dom';
afterEach(cleanup)

it('searchbox renders properly', () => {
  const { container } = render(<BrowserRouter><Searchbox /></BrowserRouter>)
  const searchbox = container.firstChild
  expect(searchbox).toMatchSnapshot()
});

// Need function testing for form submit.
