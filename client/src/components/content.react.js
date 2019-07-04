import React, { Component } from 'react';
import { StationNav, Metars, Tafs, Notams, Rvr, Timestamp } from '../components';

class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stationSelection: null,
      notamType: 'Aerodrome'
    }
  }

  onNotamTypeSelection = (type) => {
    this.setState({ ...this.state, notamType: type })
  }

  handleStationSelect = (value) => {
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

    let content;

    if (data && data[ this.state.stationSelection ]) {
      const selected = this.state.stationSelection
      const stationData = data[selected]
      const lengths = {
        'Aerodrome': stationData.notam ? stationData.notam.length : null,
        'Area': stationData.area ? stationData.area.length : null,
        'FIR': stationData.fir ? stationData.fir.length : null,
        'GPS': data[ 'other_notam' ].KGPS.length,
        'National': data[ 'other_notam' ].national ? data[ 'other_notam' ].national.length : null,
      }

      let selectedData;
      switch(this.state.notamType) {
        case 'GPS':
          selectedData = data[ 'other_notam' ].KGPS
          break;
        case 'FIR':
          selectedData = data[ selected ].fir
          break;
        case 'Aerodrome':
          selectedData = data[ selected ].notam
          break;
        case 'Area':
          selectedData = data[ selected ].area
          break;
        case 'National':
          selectedData = data[ 'other_notam' ].national
          break;
        default:
          selectedData = data[ 'other_notam' ].KGPS
      }

      content =
        <div className="content">
          <React.Fragment>
            <StationNav data={ data } selected={ selected } onClick={ this.handleStationSelect } />
            <div className="user-content">
              <div className="content-header">
                <div className="station-name">{ selected }</div>
                <Timestamp dataTime={ data.Timestamp } />
              </div>
              <div className="selected-content">
                { this.errorExists() ?
                  <React.Fragment>
                    <div id="notams">
                      <div id="notam-header">
                        <div className="subtitle">Error...</div>
                      </div>
                      This ICAO identifier does not seem to be valid...
                    </div>
                  </React.Fragment>
                  :
                  <React.Fragment>
                    <div className="metar-rvr">
                      <Rvr data={ data[ selected ].rvr } />
                      <div className="col">
                        <div>
                          <div className="subtitle">METAR</div>
                          <Metars data={ data[ selected ].metar } />
                        </div>
                        <div>
                          <div className="subtitle">TAF</div>
                          <Tafs data={ data[ selected ].taf }/>
                        </div>
                      </div>
                    </div>
                    <Notams
                      onTypeSelection={ this.onNotamTypeSelection }
                      selectedType={ this.state.notamType }
                      dataLength={ lengths }
                      data={ selectedData } />
                  </React.Fragment>
                }
              </div>
            </div>
          </React.Fragment>
        </div>
    } else {
      content =
        <div className="content">
          <div className="user-content margin-6225">
            <div className="lds-ring">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
    }

    return content
  }
}

export default Content;
