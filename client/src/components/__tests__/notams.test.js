import React from 'react';
import { render, cleanup } from 'react-testing-library'
import ReactDOM from 'react-dom';
import Notams from '../notams.react';
import 'jest-dom/extend-expect';
import testData from './test_data.json';
afterEach(cleanup)

const airports = Object.keys(testData)

airports.map(airport => {
  it('notam renders properly', () => {
    const { container } = render(<Notams data={ testData[ airport ].notam }/>)
    const notams = container.firstChild
    expect(notams).toMatchSnapshot()
  });
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
