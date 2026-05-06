import PageSection from '../components/common/PageSection.jsx'
import InfoCard from '../components/ui/InfoCard.jsx'
import Button from '../components/ui/Button.jsx'
import { useTheme } from '../theme/useTheme.js'

function MorePage() {
  const {
    appearance,
    motionOptions,
    resetAppearance,
    setMotion,
    setSurface,
    setTheme,
    surfaceOptions,
    themeOptions,
  } = useTheme()

  return (
    <>
      <PageSection className="hero-panel appearance-hero">
        <div className="appearance-hero-copy">
          <p className="eyebrow">Appearance Studio</p>
          <h1>Personnalise ton environnement de travail.</h1>
          <p className="lead">
            Chaque utilisateur peut choisir sa palette, le style des panneaux, et
            l intensite des animations pour construire une interface qui lui
            ressemble.
          </p>
        </div>

        <div className="appearance-summary-card">
          <span className="appearance-summary-label">Current setup</span>
          <strong>
            {themeOptions.find((option) => option.id === appearance.theme)?.label}
          </strong>
          <p>
            {surfaceOptions.find((option) => option.id === appearance.surface)?.label}
            {' / '}
            {motionOptions.find((option) => option.id === appearance.motion)?.label}
          </p>
          <Button variant="ghost" onClick={resetAppearance}>
            Reset to default
          </Button>
        </div>
      </PageSection>

      <section className="appearance-grid">
        <InfoCard className="appearance-card">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Theme palette</p>
              <h2>Choisis les couleurs</h2>
            </div>
          </div>

          <div className="appearance-option-grid">
            {themeOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`appearance-option-card appearance-theme-preview appearance-theme-preview-${option.id}${appearance.theme === option.id ? ' active' : ''}`}
                onClick={() => setTheme(option.id)}
              >
                <span className="appearance-option-title">{option.label}</span>
                <span className="appearance-option-copy">{option.description}</span>
              </button>
            ))}
          </div>
        </InfoCard>

        <InfoCard className="appearance-card">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Surface style</p>
              <h2>Choisis la matiere</h2>
            </div>
          </div>

          <div className="appearance-option-grid">
            {surfaceOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`appearance-option-card appearance-surface-preview appearance-surface-preview-${option.id}${appearance.surface === option.id ? ' active' : ''}`}
                onClick={() => setSurface(option.id)}
              >
                <span className="appearance-option-title">{option.label}</span>
                <span className="appearance-option-copy">{option.description}</span>
              </button>
            ))}
          </div>
        </InfoCard>
      </section>

      <section className="appearance-grid">
        <InfoCard className="appearance-card">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Motion control</p>
              <h2>Regle les animations</h2>
            </div>
          </div>

          <div className="appearance-option-grid">
            {motionOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`appearance-option-card appearance-motion-preview appearance-motion-preview-${option.id}${appearance.motion === option.id ? ' active' : ''}`}
                onClick={() => setMotion(option.id)}
              >
                <span className="appearance-option-title">{option.label}</span>
                <span className="appearance-option-copy">{option.description}</span>
                <span className="appearance-motion-bars" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </button>
            ))}
          </div>
        </InfoCard>

        <InfoCard className="appearance-card appearance-preview-card">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Live preview</p>
              <h2>Apercu de ton theme</h2>
            </div>
          </div>

          <div className="appearance-live-preview">
            <div className="appearance-preview-shell">
              <div className="appearance-preview-topbar">
                <span />
                <span />
                <span />
              </div>
              <div className="appearance-preview-body">
                <div className="appearance-preview-sidebar">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="appearance-preview-panel">
                  <div className="appearance-preview-chip-row">
                    <b />
                    <b />
                    <b />
                  </div>
                  <div className="appearance-preview-lines">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>
            <p>
              Tes choix sont enregistres localement pour retrouver ton ambiance
              de travail a chaque retour sur le site.
            </p>
          </div>
        </InfoCard>
      </section>
    </>
  )
}

export default MorePage
