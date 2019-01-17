import React from 'react';
import { render, cleanup } from 'react-testing-library'
import ReactDOM from 'react-dom';
import Searchbox from '../searchbox.react';
import 'jest-dom/extend-expect';
afterEach(cleanup)

it('searchbox renders properly', () => {
  const { container } = render(<Searchbox />)
  const searchbox = container.firstChild
  expect(searchbox).toMatchSnapshot()
});

// Need function testing for form submit.
