import React, { useCallback, useMemo, useReducer } from 'react'

import FormContext from './context'
import useMetadata from '../Metadata/useMetadata'

const initialState = {
	title: '',
	metadata: ''
}

const actionTypes = { UPDATE_FORM_DATA: 'UPDATE_FORM_DATA' }

const reducer = (state, action) => {
	switch (action.type) {
		case actionTypes.UPDATE_FORM_DATA: {
			return { ...state, ...action.data }
		}
		default:
			throw new Error('Unexpected action type')
	}
}

const FormProvider = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, initialState)
	const { selectedMetadata } = useMetadata()

	const setFormData = useCallback((data) => {
		dispatch({ type: actionTypes.UPDATE_FORM_DATA, data })
	}, [])

	const isFormDirty = useMemo(
		() =>
			state.title !== selectedMetadata?.Title ||
			state.metadata !== selectedMetadata?.Metadata,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[state]
	)

	const value = useMemo(
		() => ({
			formData: state,
			setFormData,
			isFormDirty
		}),
		[state, setFormData, isFormDirty]
	)

	return <FormContext.Provider value={value}>{children}</FormContext.Provider>
}

export default FormProvider
