import React from 'react';
import { render, cleanup } from 'react-testing-library'
import ReactDOM from 'react-dom';
import Notams from '../notams.react';
import 'jest-dom/extend-expect';
import testData from './test_data.json';
afterEach(cleanup)

testData.map(airport => {
  it('notam renders properly', () => {
    const { container } = render(<Notams data={ airport[ 'NOTAM' ] }/>)
    const notams = container.firstChild
    expect(notams).toMatchSnapshot()
  });
})

it('empty notam renders error', () => {
  const metar = []

})
