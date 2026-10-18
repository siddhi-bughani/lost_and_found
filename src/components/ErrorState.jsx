export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <h3>Something went wrong</h3>
      <p>{message || 'We could not complete your request. Please try again.'}</p>
      {onRetry && (
        <button className="btn btn--ghost" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
