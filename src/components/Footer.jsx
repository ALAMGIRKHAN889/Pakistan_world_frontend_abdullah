import { Link } from 'react-router-dom';
import Icon from './Icons';
import Logo from './Logo';
import { PORTFOLIO_URL } from '../config';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <Link to="/" className="brand" aria-label="Products World — home"><Logo variant="full" /></Link>
            <p className="muted" style={{ marginTop: 14, maxWidth: 300, fontSize: 14 }}>Shop more, live better — timeless watches, radiant skincare, fine jewelry and joyful toys, curated in one place.</p>
          </div>
          <div><h5>Shop</h5><ul><li><Link to="/shop/watches">Watches</Link></li><li><Link to="/shop/cosmetics">Cosmetics</Link></li><li><Link to="/shop/jewelry">Jewelry</Link></li><li><Link to="/shop/toys">Toys</Link></li><li><Link to="/shop?flag=newArrival">New Arrivals</Link></li><li><Link to="/shop?badge=sale">Exclusive Sale</Link></li></ul></div>
          <div><h5>Customer service</h5><ul><li><span>Shipping information</span></li><li><span>Returns &amp; refunds</span></li><li><span>FAQ</span></li><li><Link to="/account">Track order</Link></li><li><span>Terms &amp; privacy</span></li></ul></div>
          <div><h5>My account</h5><ul><li><Link to="/account">Orders &amp; tracking</Link></li><li><Link to="/account/wishlist">Wishlist</Link></li><li><Link to="/account/profile">Saved addresses</Link></li><li><Link to="/login">Sign in</Link></li></ul></div>
          <div>
            <h5>Contact &amp; concierge</h5>
            <div className="flex" style={{ marginTop: 8, alignItems: 'center' , display: 'flex'}}>
              <a className="wa-btn" href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer" aria-label="Portfolio" title="Portfolio"><Icon n="portfolio" size={16} /> Portfolio</a>
              <a className="wa-btn" style={{ marginLeft: 8 }} href="https://wa.me/923154572266" target="_blank" rel="noreferrer"><Icon n="wa" size={16} /> WhatsApp</a>
            </div>
            <ul style={{ marginTop: 14 }}><li>+92 315 4572266</li></ul>
            <h5 style={{ marginTop: 18 }}>Payment methods</h5><span className="label muted">Visa · Mastercard · Amex · COD</span>
          </div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Products World. All rights reserved.</span><span>Made by Ak</span><span>Shop More · Live Better</span></div>
      </div>
    </footer>
  );
}
