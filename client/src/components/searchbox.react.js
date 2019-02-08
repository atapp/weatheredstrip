import React, { Component } from 'react';
import LinkButton from './linkbutton.react';

class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      loading: false
    }

    // path variable allow to recognize the current web path of the app.
    this.path = window.location.pathname

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
    this.setState({ loading: true })
    const search = this.state.searchValue.toUpperCase()
    this.props.searchSubmit(search, true)
  }

  /*  State based button text allowing the button to read refresh when the
      query is the same as the currently shown data. */
  getButtonText() {
    if (this.state.loading) {
      return (
        <div style={ { display: 'flex', flexDirection: 'row', justifyContent: 'center' } }>
          <div className="dot-loader"></div>
          <div className="dot-loader"></div>
          <div className="dot-loader"></div>
        </div>
      )
    } else {
      if (this.state.searchValue === this.props.currentResults) {
        return 'Refresh'
      } else {
        return 'Get Info'
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.loading || (!this.props.currentResults && prevProps.currentResults)) {
      /*  This is a little hack to make the state reset. Everytime a re-render
          is called after a click has been activated, the loading state will be cleared. */
      this.setState({
        loading: false
      })
    }
  }

  render() {
    return (
      <form className="searchbox">
        <input className="searchbox-input" type="text" placeholder="CYMX CYUL..." value={ this.state.searchValue } onChange={ this.handleSearchChange }></input>
        <LinkButton
          className="searchbox-button"
          to={ {
            pathname: this.path,
            search: `?stations=${ this.state.searchValue }`
          } }
          type='submit'
          onClick={ this.handleSearchSubmit }>{this.getButtonText()}</LinkButton>
      </form>
    )
  }
}

export default SearchBox
