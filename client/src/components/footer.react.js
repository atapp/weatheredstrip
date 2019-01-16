import React from 'react';

function Footer() {
  const year = new Date()

  return (
    <div className="Footer">
      <div class="Footer-content">
        <div className="Footer-item">Data taken directly from <a href="https://flightplanning.navcanada.ca">NAV CANADA</a>&#8480;</div>
        <div className="Footer-item">
          <div>
            <a href="https://github.com/GregoryHamel/weatheredstrip/issues">Report an Issue</a>
          </div>
          <div>
            &copy; <a href="http://www.greghamel.com">Greg Hamel - {year.getUTCFullYear()}</a>
          </div>
        </div>
        <div className="Footer-item">Made in <span role="img" aria-label="Canada">🍁</span> with <span role="img" aria-label="love">❤️</span></div>
      </div>
    </div>
  )
}

export default Footer;
