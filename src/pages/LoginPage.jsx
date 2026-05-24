import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import './LoginPage.css'

export default function LoginPage() {
  const { manualLogin, manualRegister, initialized, keycloakReady, authenticated } = useAuth()
  const navigate = useNavigate()
  
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('developer')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canAuth = keycloakReady && initialized
  
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  const isPasswordValid = passwordRegex.test(password);
  const passwordBorderColor = isRegister && password.length > 0
    ? (isPasswordValid ? '#4ade80' : '#f87171')
    : undefined;

  React.useEffect(() => {
    if (authenticated) {
      navigate('/')
    }
  }, [authenticated, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) return

    try {
      setLoading(true)
      setError('')
      if (isRegister) {
        if (!firstName || !lastName) {
          setError('First name and last name are required')
          setLoading(false)
          return
        }
        if (!isPasswordValid) {
          setError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&#).')
          setLoading(false)
          return
        }
        await manualRegister(firstName, lastName, email, password, role)
        // Automatically login after successful registration
        await manualLogin(email, password)
      } else {
        await manualLogin(email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dlp-root hpl-root">
      {/* ── Immersive Ambient Background (Matched with Landing) ── */}
      <div className="landing-ambient landing-ambient-one" aria-hidden="true" />
      <div className="landing-ambient landing-ambient-two" aria-hidden="true" />
      <div className="landing-ambient landing-ambient-three" aria-hidden="true" />

      {/* ── Mountain Background (New Design Request) ── */}
      <div className="dlp-bg" />
      
      {/* ── Unified Top Navigation ── */}
      <nav className="dlp-nav">
        <div className="dlp-brand">
          <img src="/draco_logo_v2.png" alt="DRACO" className="dlp-logo-img" />
          <strong>DRACO</strong>
        </div>
        <div className="dlp-nav-links">
          <Link to="/">Dashboard</Link>
          <a href="#workflow">Workflow</a>
          <button 
            className="dlp-nav-btn"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Log In' : 'Join'}
          </button>
        </div>
      </nav>

      <main className="dlp-container">
        <div className="dlp-content">
          <p className="eyebrow">DRACO COMMAND CENTER</p>
          <h1 className="dlp-title">
            {isRegister ? 'Create new account.' : 'Connect to Workspace.'}
          </h1>
          <p className="dlp-switch-text">
            {isRegister ? 'Already part of the team?' : 'Access your professional dashboard.'}
            <button 
              className="dlp-switch-btn" 
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Sign In' : 'Join the Workspace'}
            </button>
          </p>

          <form className="dlp-form" onSubmit={handleLogin}>
            {error && <div className="dlp-error">{error}</div>}

            {isRegister && (
              <>
                <div className="dlp-row">
                  <div className="dlp-field">
                    <label>First name</label>
                    <input 
                      type="text" 
                      value={firstName} 
                      onChange={e => setFirstName(e.target.value)} 
                      placeholder="Prénom"
                    />
                    <span className="dlp-field-icon">👤</span>
                  </div>
                  <div className="dlp-field">
                    <label>Last name</label>
                    <input 
                      type="text" 
                      value={lastName} 
                      onChange={e => setLastName(e.target.value)} 
                      placeholder="Nom"
                    />
                    <span className="dlp-field-icon">🆔</span>
                  </div>
                </div>
                <div className="dlp-field">
                  <label>Role</label>
                  <select 
                    value={role} 
                    onChange={e => setRole(e.target.value)} 
                    style={{ width: '100%', padding: '12px 40px 12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.05)', color: 'white', appearance: 'none', cursor: 'pointer' }}
                  >
                    <option value="developer" style={{ color: 'black' }}>Developer</option>
                    <option value="chef_de_projet" style={{ color: 'black' }}>Chef de Projet</option>
                  </select>
                  <span className="dlp-field-icon">🎭</span>
                </div>
              </>
            )}

            <div className="dlp-field">
              <label>Email or Username</label>
              <input 
                type="text" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="email@company.com"
                required
              />
              <span className="dlp-field-icon">✉️</span>
            </div>

            <div 
              className="dlp-field dlp-field-active"
              style={passwordBorderColor ? { borderColor: passwordBorderColor, boxShadow: `0 0 0 1px ${passwordBorderColor}` } : {}}
            >
              <label style={passwordBorderColor ? { color: passwordBorderColor } : {}}>Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••"
                required
              />
              <span 
                className="dlp-field-icon" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: 'pointer', zIndex: 10 }}
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>

            <div className="dlp-actions">
              <button type="button" className="dlp-btn-secondary">Forgot Password?</button>
              <button 
                type="submit" 
                className="dlp-btn-primary"
                disabled={!canAuth || loading}
              >
                {loading ? 'Processing...' : isRegister ? 'Register' : 'Enter Workspace'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <div className="dlp-footer-logo">
        <img src="/draco_logo_v2.png" alt="DRACO" className="dlp-logo-img-small" />
      </div>
    </div>
  )
}



