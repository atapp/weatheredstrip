import React, { Component } from 'react';
import { StationNav, Metars, Tafs, Notams, Rvr, Timestamp } from '../components';

class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stationSelection: 0,
      navSticky: false,
    }

    this.sticky = null

    this.handleStationSelect = this.handleStationSelect.bind(this)
  }

  handleStationSelect(value) {
    this.setState({ ...this.state, stationSelection: value })
  }

  errorExists = () => {
    const { data } = this.props

    return data[ this.state.stationSelection ].ERROR ? true : false
  }

  render() {
    const { data } = this.props

    const content =
      <div className="content">
        { data ?
          <React.Fragment>
            <StationNav data={ data } selected={ this.state.stationSelection } onClick={ this.handleStationSelect } sticky={ this.state.navSticky }/>
            <div className="user-content">
              <div className="content-header">
                <div className="station-name">{ data[ this.state.stationSelection ].Station }</div>
                <Timestamp dataTime={ data[ this.state.stationSelection ].Timestamp } />
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
                        <Metars data={ data[ this.state.stationSelection ].METAR } />
                        <div className="subtitle">TAF</div>
                        <Tafs data={ data[ this.state.stationSelection ].TAF }/>
                      </div>
                    </div>
                    <div className="col">
                      <div className="subtitle">AERODROME NOTAM</div>
                      <Notams data={ data[ this.state.stationSelection ].NOTAM } />
                    </div>
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
