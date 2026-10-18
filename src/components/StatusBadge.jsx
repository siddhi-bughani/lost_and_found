export default function StatusBadge({ status }) {
  const isLost = status === 'lost'
  return (
    <span className={`badge ${isLost ? 'badge--lost' : 'badge--found'}`}>
      <span className="badge__dot" />
      {isLost ? 'Lost' : 'Found'}
    </span>
  )
}
