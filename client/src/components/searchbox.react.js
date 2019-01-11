import React, { Component } from 'react';

class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: ""
    }
    this.handleSearchChange = this.handleSearchChange.bind(this)
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this)
  }

  handleSearchChange(event) {
    this.setState({ searchValue: event.target.value })
  }

  handleSearchSubmit(event) {
    event.preventDefault()
    console.log(window.location)
    window.location.href = window.location.origin + '/weatheredstrip/?stations=' + this.state.searchValue.toUpperCase()
  }

  render() {
    return (
      <form className="searchbox">
        <input className="searchbox-input" type="text" placeholder="CYMX CYUL..." value={this.state.searchValue} onChange={ this.handleSearchChange}></input>
        <button type="submit" className="searchbox-button" onClick={this.handleSearchSubmit}>Get Info</button>
      </form>
    )
  }
}

export default SearchBox
