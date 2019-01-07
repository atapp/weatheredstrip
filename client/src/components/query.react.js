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

  serverRequest(station, callback) {
    var data = null;

    var xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          callback(JSON.parse(this.responseText))
        } else {
          window.alert("The server is unreachable...")
        }
      }
    });

    xhr.open("GET", `http://localhost:3001/airport?q=${station}`);
    xhr.send(data);
  }

  getInfo(stations) {
    let data = []

    if (stations !== this.state.stations) {
      const stationsArray = stations.split(' ')
      stationsArray.forEach(station => {
        this.serverRequest(station, res => {
          data.push(res)
          if (data.length === stationsArray.length) {
            this.setState({data: data, selectedStationIndex: 0, stations: stations})
          }
        })
      });
    } else {
      // The station has not changes, no update is to be done.
    }
  }

  render() {
    const { url } = this.props
    if (url.search) {
      let stations = queryString.parse(url.search).stations;
      this.getInfo(stations)
    }

    return <Content data={this.state.data} />

  }
}

export default Query;
