import React from 'react';
import { render, cleanup } from 'react-testing-library'
import ReactDOM from 'react-dom';
import StationNav from '../stationNav.react';
import testData from './test_data.json'
import 'jest-dom/extend-expect';
afterEach(cleanup)

it('stationNav renders properly', () => {
  const { container } = render(<StationNav data={ testData }/>)
  const stationNav = container.firstChild
  expect(stationNav).toMatchSnapshot()
});

// Need function testing for selection of other stations.
