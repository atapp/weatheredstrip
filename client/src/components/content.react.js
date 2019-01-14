import React, { Component } from 'react';
import { StationNav, Metars, Tafs, Notams, Rvr } from '../components';

class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stationSelection: 0,
      navSticky: false,
    }

    this.sticky = null

    this.handleStationSelect = this.handleStationSelect.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll() {
    if (this.sticky === null) {
      this.sticky = document.getElementById('navbar').offsetTop;
    }

    if (window.pageYOffset >= this.sticky) {
      if (!this.state.navSticky) {
        this.setState({
          navSticky: true
        })
      }
    } else {
      if (this.state.navSticky) {
        this.setState({
          navSticky: false
        })
      }
    }
  }

  handleStationSelect(value) {
    this.setState({ ...this.state, stationSelection: value })
  }

  render() {
    const { data } = this.props

    const content = data ?
      <div className="Content">
        <StationNav data={ data } selected={ this.state.stationSelection } onClick={ this.handleStationSelect } sticky={ this.state.navSticky }/>
        <div className="UserContent">
          <div className="timestamp">
            <div>Data Timestamp: {data[ this.state.stationSelection ].Timestamp}</div>
            <div>Current Timestamp: *To be completed* </div>
          </div>
          <div className="SelectedContent">
            <div className="TopPortion">
              <Rvr data={ data[ this.state.stationSelection ].RVR } />
              <div className="Col">
                <div className="subtitle">METAR</div>
                <Metars data={ data[ this.state.stationSelection ].METAR } />
                <div className="subtitle">TAF</div>
                <Tafs data={ data[ this.state.stationSelection ].TAF }/>
              </div>
            </div>
            <div className="Col">
              <div className="subtitle">AERODROME NOTAM</div>
              <Notams data={ data[ this.state.stationSelection ].NOTAM } />
            </div>
          </div>
        </div>
      </div>
      :
      <div className="Content">
        <div className="UserContent fullborder">
          <p>Please use the searchbox to initate a search.</p>
        </div>
      </div>

    return content
  }
}

export default Content;
