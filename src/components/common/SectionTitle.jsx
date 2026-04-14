function SectionTitle({ title, subtitle }) {
  return (
    <header className="section-title">
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
    </header>
  )
}

export default SectionTitle
