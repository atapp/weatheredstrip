import React from 'react';
import { render, cleanup } from 'react-testing-library'
import ReactDOM from 'react-dom';
import Metars from '../metars.react';
import 'jest-dom/extend-expect';
import testData from './test_data.json';
afterEach(cleanup)

testData.map(airport => {
  it('metar renders properly', () => {
    const { container } = render(<Metars data={ airport[ 'METAR' ] }/>)
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
