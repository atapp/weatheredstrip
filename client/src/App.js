import React, { Component } from 'react';
import './App.css';

// Import of Components
import { Content, Header } from './components';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
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
          console.log("Error", this.status)
        }
      }
    });

    xhr.open("GET", `http://localhost:3001/airport?q=${station}`);
    xhr.send(data);
  }

  getInfo(stations) {
    let data = []
    console.log(stations)
    if (stations) {
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
    return (
      <div className="App">
        <Header stationSearch={this.getInfo}/>
        {
          this.state.data ?
          <Content data={this.state.data} /> :
          <div className="Content">
            <div className="UserContent fullborder">
              <p>Please use the searchbox to initate a search.</p>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default App;
