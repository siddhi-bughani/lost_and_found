import { Link } from 'react-router-dom'

export default function Button({ to, variant = 'primary', type = 'button', children, ...rest }) {
  const cls = `btn btn--${variant}`
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  )
}
