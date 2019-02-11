import React, { Component } from 'react';
import { StationNav, Metars, Tafs, Notams, Rvr, Timestamp } from '../components';

class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stationSelection: null,
      notamType: 'Aerodrome'
    }

    this.handleStationSelect = this.handleStationSelect.bind(this)
    this.onNotamTypeSelection = this.onNotamTypeSelection.bind(this)
  }

  onNotamTypeSelection(type) {
    this.setState({ ...this.state, notamType: type })
  }

  handleStationSelect(value) {
    this.setState({ ...this.state, stationSelection: value })
  }

  errorExists = () => {
    const { data } = this.props

    if (data[ this.state.stationSelection ]) {
      return data[ this.state.stationSelection ].ERROR ? true : false
    } else {
      return false;
    }
  }

  componentDidUpdate() {
    const { data } = this.props
    if (data) {
      const airports = Object.keys(data)
      if (airports.indexOf(this.state.stationSelection) < 0) {
        this.setState({
          stationSelection: airports[ 0 ]
        })
      }
    }
  }

  render() {
    const { data } = this.props

    const content =
      <div className="content">
        { data && data[ this.state.stationSelection ] ?
          <React.Fragment>
            <StationNav data={ data } selected={ this.state.stationSelection } onClick={ this.handleStationSelect } />
            <div className="user-content">
              <div className="content-header">
                <div className="station-name">{ this.state.stationSelection }</div>
                <Timestamp dataTime={ data.Timestamp } />
              </div>
              <div className="SelectedContent">
                { this.errorExists() ?
                  <React.Fragment>
                    <h2>Error...</h2>
                    <p>This ICAO identifier does not seem to be valid or it is an international identifier which are not currently supported.</p>
                  </React.Fragment>
                  :
                  <React.Fragment>
                    <div className="metar-rvr">
                      <Rvr data={ data[ this.state.stationSelection ].RVR } />
                      <div className="col">
                        <div className="subtitle">METAR</div>
                        <Metars data={ data[ this.state.stationSelection ].metar } />
                        <div className="subtitle">TAF</div>
                        <Tafs data={ data[ this.state.stationSelection ].taf }/>
                      </div>
                    </div>
                    <Notams onTypeSelection={ this.onNotamTypeSelection } selectedType={ this.state.notamType } data={ this.state.notamType === 'GPS' ? data[ 'other_notam' ].KGPS : data[ this.state.stationSelection ].notam } />
                  </React.Fragment>
                }
              </div>
            </div>
          </React.Fragment>
          :
          <div className="user-content margin-6225">
            <div className="lds-ring">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
          }
      </div>

    return content
  }
}

export default Content;
