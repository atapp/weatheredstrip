import React from 'react';
import { render, cleanup } from '@testing-library/react'
import Tafs from '../tafs.react';
import 'jest-dom/extend-expect';
import testData from './test_data.json'
afterEach(cleanup)

const airports = Object.keys(testData)

airports.map(airport => {
  it('taf renders properly', () => {
    const { container } = render(<Tafs data={ testData[ airport ].taf }/>)
    const tafs = container.firstChild
    expect(tafs).toMatchSnapshot()
  });
})

it('empty taf renders empty', () => {
  const { container } = render(<Tafs data={ [] }/>)
  const tafs = container.firstChild
  expect(tafs).toMatchSnapshot()
})

it('no taf renders empty', () => {
  const { container } = render(<Tafs />)
  const tafs = container.firstChild
  expect(tafs).toMatchSnapshot()
})
