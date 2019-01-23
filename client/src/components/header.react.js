import React, { Component } from 'react';
import SearchBox from './searchbox.react';
import logo from './logo.svg';

class Header extends Component {
  render() {
    console.log(this.props)
    console.log(typeof this.props.searchSubmit)
    return (
      <header className="app-header">
        <div className="app-header-content">
          <div id="app-info">
            <img id="app-logo" src={ logo } alt="App Logo"/>
            <div className="app-title">
              Weathered Strip
            </div>
          </div>
          <SearchBox searchSubmit={ this.props.searchSubmit } currentResults={ this.props.currentResults }/>
        </div>
      </header>
    )
  }
}

export default Header;
