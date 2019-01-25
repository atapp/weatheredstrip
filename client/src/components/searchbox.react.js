import React, { Component } from 'react';
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

  //  Event handler for change in input.
  handleSearchChange(event) {
    this.setState({ searchValue: event.target.value })
  }

  //  Event handler for form submit
  handleSearchSubmit(event) {
    event.preventDefault()
    const search = this.state.searchValue.toUpperCase()
    this.props.searchSubmit(search, true)
  }

  /*  State based button text allowing the button to read refresh when the
      query is the same as the currently shown data. */
  getButtonText() {
    if (this.state.searchValue === this.props.currentResults) {
      return 'Refresh'
    } else {
      return 'Get Info'
    }
  }

  render() {
    // path variable allow to recognize the current web path of the app.
    const path = window.location.pathname

    return (
      <form className="searchbox">
        <input className="searchbox-input" type="text" placeholder="CYMX CYUL..." value={ this.state.searchValue } onChange={ this.handleSearchChange }></input>
        <LinkButton
          className="searchbox-button"
          to={ {
            pathname: path,
            search: `?stations=${ this.state.searchValue }`
          } }
          onClick={ (e) => this.handleSearchSubmit(e) }>{this.getButtonText()}</LinkButton>
      </form>
    )
  }
}

export default SearchBox
