import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import ReactDOM from 'react-dom';
import Searchbox from '../searchbox.react';
import 'jest-dom/extend-expect';
import { BrowserRouter } from 'react-router-dom';

const render = () => {
  const component = renderer.create(<BrowserRouter><Searchbox /></BrowserRouter>)
  return component.toJSON()
}

it('searchbox renders properly', () => {
  const component = renderer.create(<BrowserRouter><Searchbox /></BrowserRouter>)
  const tree = component.toJSON()
  expect(tree).toMatchSnapshot()
});

it('searchbox data entry changes state', () => {
  const searchbox = shallow(<Searchbox />)
  expect(searchbox).toMatchSnapshot()

  searchbox.find('input').simulate('change', { target: { value: 'CYOD' } })
  expect(searchbox.state('searchValue')).toEqual('CYOD');

  searchbox.find('input').simulate('change', { target: { value: 'CYOD CYUL' } })
  expect(searchbox.state('searchValue')).toEqual('CYOD CYUL');
})

it('searchbox data submit', () => {
  const searchbox = shallow(<Searchbox searchSubmit={
    (stations, refresh=false) => {
      expect(stations).toEqual('CYOD CYUL')
      expect(refresh).toEqual(true)
    }
  }/>)
  expect(searchbox).toMatchSnapshot()

  searchbox.find('input').simulate('change', { target: { value: 'CYOD CYUL' } })
  expect(searchbox.state('searchValue')).toEqual('CYOD CYUL');

  searchbox.find('withRouter(LinkButton)').simulate('click', {
    preventDefault: () => { }
  })
})

it('searchbutton report refresh', () => {
  const searchbox = shallow(<Searchbox currentResults="CYOD"/>)
  expect(searchbox).toMatchSnapshot()

  searchbox.find('input').simulate('change', { target: { value: 'CYOD' } })
  expect(searchbox.state('searchValue')).toEqual('CYOD');
})

// Need function testing for form submit.
