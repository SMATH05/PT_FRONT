function InfoCard({ children, className = '', wide = false }) {
  const classes = ['info-card', wide ? 'info-card-wide' : '', className]
    .filter(Boolean)
    .join(' ')

  return <article className={classes}>{children}</article>
}

export default InfoCard
