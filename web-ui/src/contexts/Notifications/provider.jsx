import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { v4 as uuid4 } from 'uuid'

import NotificationsContext from './context'
import { useEffectAfterMount, usePrevious } from '../../utils/hooks'

const MAX_NOTIFICATIONS = 5

const notifTypes = {
	SUCCESS: 'success',
	ERROR: 'error'
}

/**
 * notifications:
 * 	{
 *		message: string,
 *    type: 'success' | 'error'
 * 	}[]
 */

const initialState = []

const actionTypes = {
	ADD_NOTIFICATION: 'ADD_NOTIFICATION',
	REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
	REMOVE_ALL_NOTIFICATIONS: 'REMOVE_ALL_NOTIFICATIONS'
}

const reducer = (notifications, action) => {
	switch (action.type) {
		case actionTypes.ADD_NOTIFICATION: {
			const _notifications = [...notifications]
			_notifications.unshift(action.payload)
			return _notifications
		}
		case actionTypes.REMOVE_NOTIFICATION: {
			const _notifications = [...notifications]
			_notifications.pop()
			return _notifications
		}
		case actionTypes.REMOVE_ALL_NOTIFICATIONS: {
			return initialState
		}
		default:
			throw new Error('Unexpected action type')
	}
}

const NotificationsProvider = ({ children }) => {
	const [notifications, dispatch] = useReducer(reducer, initialState)
	const prevNotifications = usePrevious(notifications)
	const timeoutIds = useRef([])

	useEffectAfterMount(() => {
		if (notifications.length > prevNotifications.length) {
			// a new notification was just added
			const timeoutId = setTimeout(() => {
				dispatch({ type: actionTypes.REMOVE_NOTIFICATION })
				timeoutIds.current.shift()
			}, 6000)
			timeoutIds.current.push(timeoutId)
		}
		return () => {
			if (notifications.length === prevNotifications.length) {
				timeoutIds.current.forEach((tid) => {
					clearTimeout(tid)
				})
			}
		}
	}, [notifications])

	useEffect(() => {
		const handleKeyDown = (e) => {
			// keyCode 27 is Escape key
			if (e.keyCode === 27 && notifications.length) {
				dispatch({ type: actionTypes.REMOVE_ALL_NOTIFICATIONS })
				clearInterval(timeoutIds.current.shift())
			}
		}
		document.addEventListener('keydown', handleKeyDown)

		return () => document.removeEventListener('keydown', handleKeyDown)
	})

	const removeNotification = useCallback(() => {
		if (notifications.length) {
			dispatch({ type: actionTypes.REMOVE_NOTIFICATION })
			clearInterval(timeoutIds.current.shift())
		}
	}, [notifications])

	const removeAllNotifications = useCallback(() => {
		dispatch({ type: actionTypes.REMOVE_ALL_NOTIFICATIONS })
		timeoutIds.current.forEach((tid) => {
			clearTimeout(tid)
		})
	}, [])

	const notify = (type) => (message) => {
		const payload = { type, message, id: uuid4() }
		dispatch({ type: actionTypes.ADD_NOTIFICATION, payload })
	}
	const notifySuccess = useMemo(() => notify(notifTypes.SUCCESS), [])
	const notifyError = useMemo(() => notify(notifTypes.ERROR), [])

	const value = useMemo(
		() => ({
			notifications: notifications.slice(0, MAX_NOTIFICATIONS),
			notifySuccess,
			notifyError,
			removeNotification,
			removeAllNotifications
		}),
		[
			notifications,
			notifySuccess,
			notifyError,
			removeNotification,
			removeAllNotifications
		]
	)

	return (
		<NotificationsContext.Provider id="notif-provider" value={value}>
			{children}
		</NotificationsContext.Provider>
	)
}

export default NotificationsProvider
