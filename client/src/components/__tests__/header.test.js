import React from 'react';
import { render, cleanup } from 'react-testing-library'
import ReactDOM from 'react-dom';
import Header from '../header.react';
import { BrowserRouter } from 'react-router-dom';
import 'jest-dom/extend-expect';
afterEach(cleanup)

it('header renders properly', () => {
  const { container } = render(<BrowserRouter><Header /></BrowserRouter>)
  const header = container.firstChild
  expect(header).toMatchSnapshot()
});
