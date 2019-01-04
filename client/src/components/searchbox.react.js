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
    const stations = this.state.searchValue.toUpperCase().split(" ")
    console.log(stations)
    this.props.stationSearch(stations)
  }

  render() {
    return (
      <div className="searchbox">
        <input className="searchbox-input" type="text" placeholder="CYMX CYUL..." value={this.state.searchValue} onChange={ this.handleSearchChange}></input>
        <button className="searchbox-button" onClick={this.handleSearchSubmit}>Get Info</button>
      </div>
    )
  }
}

export default SearchBox
