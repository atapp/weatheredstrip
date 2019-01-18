import React, { Component } from 'react';
import SearchBox from './searchbox.react';
import logo from './logo.svg';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: ''
    }
    this.handleSearchChange = this.handleSearchChange.bind(this)
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this)
  }

  handleSearchChange(event) {
    this.setState({ searchValue: event.target.value })
  }

  handleSearchSubmit(event) {
    event.preventDefault()
    const stations = this.state.searchValue.toUpperCase().split(' ')
    console.log(stations)
    this.props.stationSearch(stations)
  }

  render() {
    return (
      <header className="App-header">
        <div className="App-header-content">
          <div id="app-info">
            <img id="app-logo" src={ logo } alt="App Logo"/>
            <div className="App-Title">
              Weathered Strip
            </div>
          </div>
          <SearchBox stationSearch={ this.props.stationSearch }/>
        </div>
      </header>
    )
  }
}

export default Header;
