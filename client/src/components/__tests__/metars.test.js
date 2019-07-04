import React from 'react';
import { render, cleanup } from '@testing-library/react'
import Metars from '../metars.react';
import 'jest-dom/extend-expect';
import testData from './test_data.json';
afterEach(cleanup)

const airports = Object.keys(testData)

airports.map(airport => {
  it('metar renders properly', () => {
    const { container } = render(<Metars data={ testData[ airport ].metar }/>)
    const metars = container.firstChild
    expect(metars).toMatchSnapshot()
  });
})

it('empty metar renders nothing', () => {
  const { container } = render(<Metars data={ [] }/>)
  const metars = container.firstChild
  expect(metars).toMatchSnapshot()
})

it('empty metar renders nothing', () => {
  const { container } = render(<Metars />)
  const metars = container.firstChild
  expect(metars).toMatchSnapshot()
})
