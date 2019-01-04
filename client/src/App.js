import React, { Component } from 'react';
import './App.css';

// Import of Components
import { Content, Metars, Notams, Tafs, StationNav } from './components';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
    };
  }

  serverRequest(station, callback) {
    var data = null;

    var xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          callback(JSON.parse(this.responseText))
        } else {
          console.log("Error", this.status)
        }
      }
    });

    xhr.open("GET", `http://localhost:3001/airport?q=${station}`);
    xhr.send(data);
  }

  getInfo(stations) {
    if (this.state.data === null) {
      let data = []
      stations.forEach(station => {
        this.serverRequest(station, res => {
          data.push(res)
          if (data.length === stations.length) {
            this.setState({data: data})
            this.setState({selectedStationIndex: 0})
          }
        })
      });
    }
  }

  render() {
    this.getInfo(["CYMX", "CYUL"])

    return (
      <div className="App">
        <header className="App-header">
          Weathered Strip
        </header>
        {
          this.state.data ?
          <Content data={this.state.data} /> : null
        }
      </div>
    );
  }
}

export default App;
