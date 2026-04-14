function PageSection({ children, className = '' }) {
  const classes = ['page-section', className].filter(Boolean).join(' ')

  return <section className={classes}>{children}</section>
}

export default PageSection
