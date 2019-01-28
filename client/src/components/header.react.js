import React, { Component } from 'react';
import SearchBox from './searchbox.react';
import logo from './logo.svg';

class Header extends Component {
  constructor(props) {
    super(props)
    this.path = window.location.pathname
  }

  render() {
    return (
      <header className="app-header">
        <div className="app-header-content">
          <a href={ this.path }>
            <div id="app-info">
              <img id="app-logo" src={ logo } alt="App Logo"/>
              <div className="app-title">
                Weathered Strip
              </div>
            </div>
          </a>
          <SearchBox searchSubmit={ this.props.searchSubmit } currentResults={ this.props.currentResults }/>
        </div>
      </header>
    )
  }
}

export default Header;
