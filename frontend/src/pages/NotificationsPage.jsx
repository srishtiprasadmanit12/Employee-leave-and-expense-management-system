import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import {
  clearNotificationsError,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '../features/notifications/notificationsSlice'

const NotificationsPage = () => {
  const dispatch = useDispatch()
  const { items, unreadCount, loading, submitting, error, pagination } =
    useSelector(state => state.notifications)

  const [unreadOnly, setUnreadOnly] = useState(false)
  const [pageInput, setPageInput] = useState(1)

  const loadNotifications = (page = 1) => {
    dispatch(
      fetchNotifications({
        page,
        limit: pagination.limit,
        unreadOnly
      })
    )
  }

  useEffect(() => {
    setPageInput(pagination.page)
  }, [pagination.page])

  useEffect(() => {
    loadNotifications(1)

    return () => {
      dispatch(clearNotificationsError())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, unreadOnly])

  const onMarkRead = async notificationId => {
    const result = await dispatch(markNotificationRead(notificationId))
    if (markNotificationRead.fulfilled.match(result)) {
      loadNotifications(pagination.page)
    }
  }

  const onMarkAll = async () => {
    const result = await dispatch(markAllNotificationsRead())
    if (markAllNotificationsRead.fulfilled.match(result)) {
      loadNotifications(pagination.page)
    }
  }

  const onPageSubmit = event => {
    event.preventDefault()
    const nextPage = Math.min(
      Math.max(Number(pageInput) || 1, 1),
      pagination.totalPages
    )
    loadNotifications(nextPage)
  }

  return (
    <div className="module-layout">
      <header className="module-header">
        <div>
          <h1>Notifications</h1>
          <p>Alerts for leave and expense decisions.</p>
        </div>
        <div className="module-links">
          <Link to="/dashboard" className="secondary-btn button-link">
            Dashboard
          </Link>
          <Link to="/profile" className="secondary-btn button-link">
            My Profile
          </Link>
        </div>
      </header>

      <section className="panel">
        <div className="module-section-head">
          <h2>Inbox</h2>
          <div className="module-links">
            <span className="pill">Unread: {unreadCount}</span>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setUnreadOnly(prev => !prev)}
            >
              {unreadOnly ? 'Show All' : 'Show Unread'}
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={onMarkAll}
              disabled={submitting || unreadCount === 0}
            >
              Mark All Read
            </button>
          </div>
        </div>

        {loading ? <p>Loading notifications...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        <div className="notification-list">
          {items.map(item => (
            <article
              key={item.id}
              className={`notification-card ${item.isRead ? '' : 'unread'}`}
            >
              <div>
                <h3>{item.title}</h3>
                <p>{item.message}</p>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </div>
              {!item.isRead ? (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => onMarkRead(item.id)}
                  disabled={submitting}
                >
                  Mark Read
                </button>
              ) : (
                <span className="status-badge status-approved">Read</span>
              )}
            </article>
          ))}
        </div>

        {items.length === 0 && !loading ? <p>No notifications found.</p> : null}

        <div className="pagination-bar">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => loadNotifications(pagination.page - 1)}
            disabled={!pagination.hasPrevPage || loading}
          >
            Previous
          </button>

          <form onSubmit={onPageSubmit} className="jump-form">
            <label htmlFor="notification-page">Page</label>
            <input
              id="notification-page"
              type="number"
              min={1}
              max={pagination.totalPages}
              value={pageInput}
              onChange={event => setPageInput(event.target.value)}
            />
            <span>of {pagination.totalPages}</span>
            <button type="submit" className="secondary-btn">
              Go
            </button>
          </form>

          <button
            type="button"
            className="secondary-btn"
            onClick={() => loadNotifications(pagination.page + 1)}
            disabled={!pagination.hasNextPage || loading}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  )
}

export default NotificationsPage
