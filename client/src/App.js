import React, { Component } from 'react';
import './App.css';


// Import of Components
import { Header, Query } from './components';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <Query url={this.props.url} />
      </div>
    );
  }
}

export default App;
