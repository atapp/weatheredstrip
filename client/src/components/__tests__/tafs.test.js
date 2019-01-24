import React from 'react';
import { render, cleanup } from 'react-testing-library'
import ReactDOM from 'react-dom';
import Tafs from '../tafs.react';
import 'jest-dom/extend-expect';
import testData from './test_data.json'
afterEach(cleanup)

testData.map(airport => {
  it('taf renders properly', () => {
    const { container } = render(<Tafs data={ airport[ 'TAF' ] }/>)
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
