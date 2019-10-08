import React from 'react';

const Home = () => {
  return (
    <div className="content">
      <div className="user-content fullborder">
        <h1>Welcome to Weathered Strip</h1>
        <p>Weathered Strip was created to help gather all required flight planning documentation in one place. It provides NOTAMs and METARs/TAFs for each requested airport. Live Winds and GFA will be included shortly.</p>
        <h2>How to...</h2>
        <h3>First use</h3>
        <p>To use Weathered Strip, please enter the ICAO or IATA airport codes of each airport you'd like to assess in the seachbox located in the header.</p>
        <p>Note: for multiple airport codes, separate them by either spaces or commas.</p>
        <h3>Report an issue</h3>
        <p>Weathered Strip is not perfect and its developer is always looking to improve its feel and squash nasty bugs.</p>
        <p>Please use the "Report an Issue" link located in the footer to request a new feature, make a suggestion, report a bug, etc.</p>
        <h3>Contribute</h3>
        <p>Want to contribute to Weathered Strip? Please do! Fork me on <a href="https://github.com/Greg-Hamel/weatheredstrip/">GitHub&trade;</a> and make a pull request. I'll be more than happy to review it and include it in the code.</p>
      </div>
    </div>
  )
}

export default Home;
