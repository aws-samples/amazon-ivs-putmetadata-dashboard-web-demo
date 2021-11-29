import { useContext } from 'react'
import NotificationsContext from './context'

const useNotifications = () => {
	const context = useContext(NotificationsContext)

	if (!context) {
		throw new Error(
			'Notifications context must be consumed inside the Notifications Provider'
		)
	}

	return context
}

export default useNotifications
