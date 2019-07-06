import React from 'react';
import { render, cleanup } from '@testing-library/react'
import App from '../App';
import 'jest-dom/extend-expect';
afterEach(cleanup)

it('Renders nothing is provided', () => {
  const { container } = render(<App/>)
  const app = container.firstChild
  expect(app).toMatchSnapshot()
});
