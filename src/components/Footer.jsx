import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <p className="site-footer__title">Lost &amp; Found</p>
          <p className="site-footer__sub">A service of the Office of Campus Life.</p>
        </div>
        <nav className="site-footer__nav">
          <Link to="/browse">Browse items</Link>
          <Link to="/report">Report an item</Link>
          <Link to="/my-reports">My reports</Link>
        </nav>
        <p className="site-footer__note">
          &copy; {new Date().getFullYear()} University Campus. Items are held per
          campus policy. Questions: campus-life@university.edu.
        </p>
      </div>
    </footer>
  )
}
