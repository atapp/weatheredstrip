import React from 'react';
import { shallow } from 'enzyme';
import ReactDOM from 'react-dom';
import Header from '../header.react';
import { BrowserRouter } from 'react-router-dom';
import 'jest-dom/extend-expect';

it('header renders properly', () => {
  const { header } = shallow(<Header />)
  expect(header).toMatchSnapshot()
});
