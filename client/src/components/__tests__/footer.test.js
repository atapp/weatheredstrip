import React from 'react';
import { render, cleanup } from '@testing-library/react'
import Footer from '../footer.react';
import 'jest-dom/extend-expect';
afterEach(cleanup)

it('footer renders properly', () => {
  const { container } = render(<Footer />)
  const footer = container.firstChild
  expect(footer).toMatchSnapshot()
});
