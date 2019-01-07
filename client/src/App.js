import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';


// Import of Components
import { Content, Header, Query } from './components';

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router>
        <div className="App">
          <Header />

          <Query url={this.props.url} />
        </div>
      </Router>
    );
  }
}

export default App;
