import React from 'react';

function Footer({ }) {
  return (
    <div className="Footer">
      <div class="Footer-content">
        <div className="Footer-item">Data taken directly from <a href="https://flightplanning.navcanada.ca">NAV CANADA</a>&#8480;</div>
        <div className="Footer-item"><a href="https://github.com/GregoryHamel/weatheredstrip/issues">Report an Issue</a></div>
        <div className="Footer-item">Made in <span role="img" aria-label="Canada">🍁</span> with <span role="img" aria-label="love">❤️</span></div>
      </div>
    </div>
  )
}

export default Footer;
