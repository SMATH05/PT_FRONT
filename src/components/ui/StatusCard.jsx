function StatusCard({ children, tone = 'neutral', title }) {
  return (
    <div className={`status-card status-${tone}`}>
      {title ? <span className="status-label">{title}</span> : null}
      {children}
    </div>
  )
}

export default StatusCard
