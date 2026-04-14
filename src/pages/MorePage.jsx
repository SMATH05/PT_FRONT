import PageSection from '../components/common/PageSection.jsx'
import InfoCard from '../components/ui/InfoCard.jsx'

function MorePage() {
  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">More</p>
        <h1>More application areas can live here.</h1>
        <p className="lead">
          Use this page for dashboard shortcuts, settings, administration,
          reports, or feature links as your frontend grows.
        </p>
      </PageSection>

      <section className="info-grid">
        <InfoCard>
          <h2>Ideas for this section</h2>
          <ul className="detail-list">
            <li>Administration tools</li>
            <li>Reports and analytics</li>
            <li>Application settings</li>
          </ul>
        </InfoCard>

        <InfoCard>
          <h2>Routing status</h2>
          <p>
            This page is now connected through <code>react-router-dom</code> and
            rendered inside the shared application layout.
          </p>
        </InfoCard>
      </section>
    </>
  )
}

export default MorePage
