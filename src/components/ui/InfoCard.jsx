function InfoCard({ children, wide = false }) {
  const classes = ['info-card', wide ? 'info-card-wide' : '']
    .filter(Boolean)
    .join(' ')

  return <article className={classes}>{children}</article>
}

export default InfoCard
