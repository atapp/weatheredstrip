import React, { Component } from 'react';
import { StationNav, Metars, Tafs, Notams } from "../components";

class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stationSelection: 0
    }

    this.handleStationSelect = this.handleStationSelect.bind(this)
  }

  handleStationSelect(value) {
    this.setState({...this.state, stationSelection: value})
  }

  render() {
    const { data } = this.props

    return (
      <div className="Content">
        <StationNav data={data} selected={this.state.stationSelection} onClick={this.handleStationSelect}/>
        <div className="UserContent">
          <div className="Timestamp">Data Timestamp: {data[this.state.stationSelection].Timestamp}</div>
          <div className="Timestamp current">Current Timestamp: *To be completed* </div>
          <div className="SelectedContent">
            <div className="TopPortion">
              <img id="RVR" height="300" width="300" src={data[this.state.stationSelection].RVR} />
              <div className="Col">
                <div className="subtitle">METAR</div>
                <Metars data={data[this.state.stationSelection].METAR} />
                <div className="subtitle">TAF</div>
                <Tafs data={data[this.state.stationSelection].TAF}/>
              </div>
            </div>
            <div className="Col">
              <div className="subtitle">NOTAM</div>
              <Notams data={data[this.state.stationSelection].NOTAM} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Content;
