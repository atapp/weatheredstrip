import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import LinkButton from './linkbutton.react';

class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: ''
    }
    this.handleSearchChange = this.handleSearchChange.bind(this)
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this)
    this.getButtonText = this.getButtonText.bind(this)
  }

  handleSearchChange(event) {
    this.setState({ searchValue: event.target.value })
  }

  handleSearchSubmit(event) {
    event.preventDefault()
    const searchPath = 'airports'
    const search = this.state.searchValue.toUpperCase()
    this.props.searchSubmit(search, true)
    console.log('done')
  }

  getButtonText() {
    if (this.state.searchValue === this.props.currentResults) {
      return 'Refresh'
    } else {
      return 'Get Info'
    }
  }

  render() {
    console.log('Results prop:')
    console.log(this.props.currentResults)
    return (
      <form className="searchbox">
        <input className="searchbox-input" type="text" placeholder="CYMX CYUL..." value={ this.state.searchValue } onChange={ this.handleSearchChange }></input>
        <LinkButton
          className="searchbox-button"
          to={ {
            pathname: '/airports',
            search: `?stations=${ this.state.searchValue }`
          } }
          onClick={ (e) => this.handleSearchSubmit(e) }>{this.getButtonText()}</LinkButton>
      </form>
    )
  }
}

export default SearchBox
