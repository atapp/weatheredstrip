import React from 'react';
import { render, cleanup } from 'react-testing-library'
import ReactDOM from 'react-dom';
import Content from '../content.react';
import 'jest-dom/extend-expect';
import testData from './test_data.json';
afterEach(cleanup)

// Full content is not tested yet, because timestamp is dependent on current time.
it('Content without renders properly', () => {
  const { container } = render(<Content />)
  const content = container.firstChild
  expect(content).toMatchSnapshot()
});
