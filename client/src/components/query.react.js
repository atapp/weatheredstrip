import React, { Component } from 'react';
import queryString from 'query-string';
import Content from './content.react';

class Query extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
      stations: null,
    };

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

    xhr.open('GET', `http://greghamel.com:3001/airport?q=${ stations }`);
    xhr.send(data);
  }

  getInfo(stations) {
    if (stations !== this.state.stations) {
      console.log(stations)

      this.serverRequest(stations, res => {
        const data = res
        this.setState({ data: data, selectedStationIndex: 0, stations: stations })
      })
    } else {
      // The station has not changes, no update is to be done.
    }
  }

  render() {
    const { url } = this.props
    if (url.search) {
      const stations = queryString.parse(url.search).stations;
      console.log(stations)
      this.getInfo(stations)
    }

    return <Content data={ this.state.data } />

  }
}

export default Query;
