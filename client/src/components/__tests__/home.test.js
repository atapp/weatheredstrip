import React from 'react';
import { render, cleanup } from '@testing-library/react'
import Home from '../home.react';
import 'jest-dom/extend-expect';
import testData from './test_data.json';
afterEach(cleanup)

it('renders', () => {
  const { container } = render(<Home />)
  const metars = container.firstChild
  expect(metars).toMatchSnapshot()
});
