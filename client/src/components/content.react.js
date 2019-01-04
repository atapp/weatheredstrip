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
    console.log(data[this.state.stationSelection].TAF)
    return (
      <div className="Content">
        <div className="Selector">
          <StationNav data={data} selected={this.state.stationSelection} onClick={this.handleStationSelect}/>
        </div>
        <div className="SelectedContent">
          <div className="Col">
            <div className="subtitle">METAR</div>
            <Metars data={data[this.state.stationSelection].METAR} />
            <div className="subtitle">TAF</div>
            <Tafs data={data[this.state.stationSelection].TAF}/>
          </div>
          <div className="Col">
            <div className="subtitle">NOTAM</div>
            <Notams data={data[this.state.stationSelection].NOTAM} />
          </div>
        </div>
      </div>
    )
  }
}

export default Content;
