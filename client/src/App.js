import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import queryString from 'query-string';
import './App.css';

// Import of Components
import { Footer, Header, Home, Content } from './components';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      stations: null,
    };

    this.path = window.location.path

    this.serverRequest = this.serverRequest.bind(this)
    this.getInfo = this.getInfo.bind(this)
  }

  serverRequest(stations, callback) {
    const data = null;

    var xhr = new XMLHttpRequest();

    xhr.addEventListener('readystatechange', function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          callback(JSON.parse(this.responseText))
        } else {
          window.alert('The server is unreachable...')
        }
      }
    });

    if (process.env.NODE_ENV === 'production') {
      xhr.open('GET', `/api/airport?q=${ stations }`);
    } else if (process.env.NODE_ENV === 'development') {
      xhr.open('GET', `/airport?q=${ stations }`);
    }

    xhr.send(data);
  }

  getInfo(stations, refresh=false) {
    if (stations && (stations !== this.state.stations || refresh)) {
      this.serverRequest(stations, res => {
        console.log(res)
        if (res.length > 0) {
          this.setState({
            data: res,
            selectedStationIndex: 0,
            stations: stations
          })
        }
      })
    } else {
      // The station has not changed, no update is to be done.
    }
  }

  componentDidMount() {

  }

  render() {
    return (
      <Router>
        <div className="app">
          <Header searchSubmit={ (stations, refresh) => this.getInfo(stations, refresh) } currentResults={ this.state.stations }/>
          <Route
            path={ this.path } exact
            render={ props => {
              const stations = queryString.parse(props.location.search).stations
              if ( stations ) {
                this.getInfo(stations)
                return <Content data={ this.state.data } />
              } else {
                return <Home />
              }
            } }
          />
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
