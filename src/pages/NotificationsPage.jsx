import { useEffect, useState } from 'react'
import PageSection from '../components/common/PageSection.jsx'
import InfoCard from '../components/ui/InfoCard.jsx'
import Button from '../components/ui/Button.jsx'
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationService.js'
import { getCollection } from '../utils/apiResponse.js'

function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await getNotifications()
      setNotifications(getCollection(response))
    } catch (err) {
      setError('Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id)
      setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date() } : n))
    } catch (err) {
      console.error('Failed to mark as read', err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, read_at: new Date() })))
    } catch (err) {
      console.error('Failed to mark all as read', err)
    }
  }

  return (
    <>
      <PageSection className="hero-panel">
        <p className="eyebrow">Announcements</p>
        <h1>Your notifications.</h1>
        <p className="lead">Stay updated on task completions and project milestones.</p>
      </PageSection>

      <section className="info-grid">
        <InfoCard wide>
          <div className="page-toolbar">
            <h2>Recent Activity</h2>
            {notifications.some(n => !n.read_at) && (
              <Button variant="ghost" onClick={handleMarkAllRead}>
                Mark all as read
              </Button>
            )}
          </div>

          {loading ? (
            <p className="feedback-message">Loading announcements...</p>
          ) : error ? (
            <p className="feedback-message feedback-error">{error}</p>
          ) : notifications.length === 0 ? (
            <p className="feedback-message">No notifications yet.</p>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.read_at ? 'read' : 'unread'}`}
                  onClick={() => !notification.read_at && handleMarkRead(notification.id)}
                >
                  <div className="notification-dot" />
                  <div className="notification-content">
                    <p className="notification-message">{notification.data.message}</p>
                    <span className="notification-date">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </InfoCard>
      </section>

      <style>{`
        .notification-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .notification-item:hover {
          background: rgba(255, 255, 255, 0.06);
        }
        .notification-item.unread {
          border-left: 3px solid var(--accent-color, #53d7ff);
          background: rgba(83, 215, 255, 0.05);
        }
        .notification-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-color, #53d7ff);
          margin-top: 6px;
          flex-shrink: 0;
          opacity: 0;
        }
        .notification-item.unread .notification-dot {
          opacity: 1;
        }
        .notification-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .notification-message {
          margin: 0;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
        }
        .notification-date {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  )
}

export default NotificationsPage
