import React from 'react';
import { render, cleanup } from '@testing-library/react'
import StationNav from '../stationNav.react';
import testData from './test_data.json'
import 'jest-dom/extend-expect';
afterEach(cleanup)

it('stationNav renders properly', () => {
  const { container } = render(<StationNav data={ testData }/>)
  const stationNav = container.firstChild
  expect(stationNav).toMatchSnapshot()
});

for (let i=0; i < testData.length; i++) {
  it('stationNav renders selected', () => {
    const { container } = render(<StationNav selected={ i } data={ testData }/>)
    const stationNav = container.firstChild
    expect(stationNav).toMatchSnapshot()
  });
}

it('stationNav renders properly', () => {
  const { container } = render(<StationNav />)
  const stationNav = container.firstChild
  expect(stationNav).toMatchSnapshot()
});

// Need function testing for selection of other stations.
