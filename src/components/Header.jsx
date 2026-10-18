import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand__mark">L&amp;</span>
          <span className="brand__text">
            Lost &amp; Found
            <small>University Campus</small>
          </span>
        </Link>

        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /> <span /> <span />
        </button>

        <nav className={`site-nav ${open ? 'is-open' : ''}`}>
          <NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/browse" onClick={() => setOpen(false)}>Browse</NavLink>
          <NavLink to="/report" onClick={() => setOpen(false)}>Report</NavLink>
          <NavLink to="/my-reports" onClick={() => setOpen(false)}>My Reports</NavLink>
          <NavLink to="/login" className="site-nav__signin" onClick={() => setOpen(false)}>
            Sign in
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
