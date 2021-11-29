import React, { useCallback, useEffect, useMemo, useReducer } from 'react'
import ModalContext from './context'

/**
 * confirmAction: {
 * 	callback: () => {},
 * 	buttonText: string,
 * 	buttonType: 'primary' | 'secondary' | 'destruct' | 'confirm'
 * }
 */

const initialState = {
	isVisible: false,
	message: '',
	confirmAction: null
}

const actionTypes = {
	SHOW_MODAL: 'SHOW_MODAL',
	HIDE_MODAL: 'HIDE_MODAL'
}

const reducer = (state, action) => {
	switch (action.type) {
		case actionTypes.SHOW_MODAL: {
			const { message, confirmAction } = action.payload
			return { isVisible: true, message, confirmAction }
		}
		case actionTypes.HIDE_MODAL: {
			return initialState
		}
		default:
			throw new Error('Unexpected action type')
	}
}

const ModalProvider = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, initialState)

	const hideModal = useCallback(() => {
		dispatch({ type: actionTypes.HIDE_MODAL })
	}, [])

	const showModal = useCallback(
		(message, confirmAction) => {
			const callback = () => {
				confirmAction?.callback()
				hideModal()
			}
			const payload = {
				message,
				confirmAction: {
					buttonText: confirmAction.buttonText || 'Continue',
					buttonType: confirmAction.buttonType || 'confirm',
					callback
				}
			}
			dispatch({ type: actionTypes.SHOW_MODAL, payload })
		},
		[hideModal]
	)

	useEffect(() => {
		const handleKeyDown = (e) => {
			// keyCode 27 is the Escape key
			if (e.keyCode === 27) {
				hideModal()
			}
		}
		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	})

	const value = useMemo(
		() => ({ ...state, showModal, hideModal }),
		[state, showModal, hideModal]
	)

	return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
}

export default ModalProvider
