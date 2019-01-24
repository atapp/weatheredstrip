import React from 'react';
import { shallow, mount } from 'enzyme';
import ReactDOM from 'react-dom';
import Content from '../content.react';
import 'jest-dom/extend-expect';
import testData from './test_data.json';

// Full content is not tested yet, because timestamp is dependent on current time.
it('Content renders properly when empty', () => {
  const component = shallow(<Content />)
  expect(component).toMatchSnapshot()
});

it('content renders properly with data', () => {
  const content = shallow(<Content data={ testData }/>)
  expect(content).toMatchSnapshot()
})
