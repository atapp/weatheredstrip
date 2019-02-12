import React from 'react';
import { render, cleanup } from 'react-testing-library'
import ReactDOM from 'react-dom';
import Notams from '../notams.react';
import 'jest-dom/extend-expect';
import testData from './test_data.json';
afterEach(cleanup)

const airports = Object.keys(testData)
const typeLengths = [
  {
    Aerodrome: 35,
    FIR: 48,
    GPS: 2,
  },
  {
    Aerodrome: 0,
    FIR: 13,
    GPS: 25,
  },
  {
    Aerodrome: 54,
    FIR: 0,
    GPS: 11,
  },
  {
    Aerodrome: 87,
    FIR: 32,
    GPS: 0,
  },
]

airports.map(airport => {
  typeLengths.map(lengths => {
    it('notam renders properly', () => {
      const { container } = render(<Notams dataLength={ lengths } data={ testData[ airport ].notam }/>)
      const notams = container.firstChild
      expect(notams).toMatchSnapshot()
    });
  })
})

it('empty notam renders error', () => {
  const { container } = render(<Notams data={ [] }/>)
  const notams = container.firstChild
  expect(notams).toMatchSnapshot()
})

it('empty notam renders error', () => {
  const { container } = render(<Notams />)
  const notams = container.firstChild
  expect(notams).toMatchSnapshot()
})
