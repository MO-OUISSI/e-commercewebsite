import React from 'react';
import { businessConfig } from '../data/businessConfig';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { name, fullName, description, socials, footerLinks } = businessConfig;

  return (
    <footer className="footer">
      <div className="footer-container max-w-7xl">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <a href="/" className="footer-logo">{name}.</a>
            <p className="brand-desc">
              {description}
            </p>
            <div className="social-links">
              {socials.map((social, index) => (
                <a key={index} href={social.url} className="social-link" aria-label={social.name}>
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Links sections */}
          {footerLinks.map((section, idx) => (
            <div key={idx} className="footer-links">
              <h4 className="links-title">{section.title}</h4>
              <ul className="links-list">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <a href={link.url} className="link-item">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="footer-newsletter">
            <h4 className="links-title">Newsletter</h4>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <div className="input-wrapper">
                <input 
                  type="email" 
                  placeholder="email@address.com" 
                  className="newsletter-input"
                />
              </div>
              <button type="submit" className="newsletter-submit">
                Subscribe
              </button>
            </form>
            <p className="newsletter-note">By subscribing you agree to our Terms & Privacy Policy.</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">&copy; {currentYear} {fullName}. All rights reserved.</p>
          <div className="bottom-links">
            <a href="#!" className="bottom-link">Privacy</a>
            <a href="#!" className="bottom-link">Terms</a>
            <a href="#!" className="bottom-link">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
