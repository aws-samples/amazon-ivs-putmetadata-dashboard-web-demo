import React, { useCallback, useMemo, useReducer } from 'react'
import axios from 'axios'
import _ from 'lodash'

import useNotifications from '../Notifications/useNotifications'
import MetadataContext from './context'
import { getApiUrlBase } from '../../utils/helpers'

/*
  Example Metadata object:

  {
    Id: 'a1b2c3d4-1234-5678-abcd-a1b2c3d4e5f6',
    Channel: 'my_channel',
    Title: 'Untitled',
    Metadata: '{...}',
    CreatedDate: '1634072311812',
    Sent: 'Yes'
  }
*/

const initialState = {
	selectedMetadataIdx: 0,
	metadataList: [],
	isStale: false,
	latestMetadata: null
}

const actionTypes = {
	UPDATE_METADATA_LIST: 'UPDATE_METADATA_LIST',
	UPDATE_METADATA_ITEM: 'UPDATE_METADATA_ITEM',
	REFRESH_CURRENT_METADATA_ITEM: 'REFRESH_CURRENT_METADATA_ITEM',
	SET_LATEST_METADATA: 'SET_LATEST_METADATA',
	SET_SELECTED_METADATA: 'SET_SELECTED_METADATA'
}

const reducer = (state, action) => {
	switch (action.type) {
		case actionTypes.UPDATE_METADATA_LIST: {
			const { metadataList, newSelectedMetadataIdx } = action
			const selectedMetadataIdx = !isNaN(newSelectedMetadataIdx)
				? Math.max(0, newSelectedMetadataIdx)
				: state.selectedMetadataIdx
			return {
				...state,
				selectedMetadataIdx,
				metadataList,
				isStale: false,
				latestMetadata: null
			}
		}

		case actionTypes.UPDATE_METADATA_ITEM: {
			const newMetadataList = state.metadataList.map((md) =>
				md.Id === action.metadataItem.Id ? action.metadataItem : md
			)
			return {
				...state,
				metadataList: newMetadataList,
				isStale: false,
				latestMetadata: null
			}
		}

		case actionTypes.REFRESH_CURRENT_METADATA_ITEM: {
			const { metadataList, selectedMetadataIdx } = state
			const newMetadataList = [...metadataList]
			newMetadataList[selectedMetadataIdx] = state.latestMetadata
			return {
				...state,
				metadataList: newMetadataList,
				isStale: false,
				latestMetadata: null
			}
		}

		case actionTypes.SET_LATEST_METADATA: {
			return { ...state, isStale: true, latestMetadata: action.latestMetadata }
		}

		case actionTypes.SET_SELECTED_METADATA: {
			const selectedMetadataIdx = state.metadataList.findIndex(
				(md) => md.Id === action.selectedMetadataId
			)
			return { ...state, selectedMetadataIdx, isStale: false, latestMetadata: null }
		}

		default:
			throw new Error('Unexpected action type')
	}
}

const MetadataProvider = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, initialState)
	const { notifyError, removeAllNotifications } = useNotifications()

	const updateMetadataList = useCallback(
		async (newSelectedMetadataIdx) => {
			try {
				const response = await axios(getApiUrlBase())
				const rawMetadataList = response.data
				// Sorting in reverse chronological order
				const metadataList = rawMetadataList.sort((a, b) => b.CreatedDate - a.CreatedDate)
				dispatch({
					type: actionTypes.UPDATE_METADATA_LIST,
					metadataList,
					newSelectedMetadataIdx
				})
			} catch (err) {
				console.error(err)
				notifyError('Unable to retrieve TimedMetadata')
			}
		},
		[notifyError]
	)

	const updateMetadataItem = useCallback((metadataItem) => {
		dispatch({ type: actionTypes.UPDATE_METADATA_ITEM, metadataItem })
	}, [])

	const refreshCurrentMetadata = useCallback(() => {
		dispatch({ type: actionTypes.REFRESH_CURRENT_METADATA_ITEM })
	}, [])

	/**
	 * Refetches the metadata item pertaining to the provided ID and performs a
	 * deep equality check between the returned result (latest) and the currently
	 * cached data in the state (prev). If the cached data is found to be invalid
	 * (latest and prev are not equal), then the isStale flag is set to true and
	 * the latest data is saved in state. If forceUpdate is true, the metadata
	 * item in the list is updated to the latest data right away.
	 * @param {string}  metadataId	the id of the metadata item to refetch
	 * @param {boolean} forceUpdate forces an update of the metadata list item
	 */
	const refetchMetadataItem = useCallback(
		async (metadataId, forceUpdate = false) => {
			try {
				const response = await axios(`${getApiUrlBase()}?id=${metadataId}`)
				const latestMetadata = response.data
				const prevMetadata = state.metadataList.find((md) => md.Id === metadataId)
				if (!_.isEqual(latestMetadata, prevMetadata)) {
					if (forceUpdate) {
						updateMetadataItem(latestMetadata)
					} else {
						dispatch({ type: actionTypes.SET_LATEST_METADATA, latestMetadata })
					}
				}
			} catch (err) {
				console.error(err)
				notifyError('Unable to retrieve latest TimedMetadata')
			}
		},
		[state, notifyError, updateMetadataItem]
	)

	/**
	 * Selects the item from the metadata list with the provided id by setting
	 * the selectedMetadataIdx in the state, then refetches the selected item
	 * to check whether the cached data is stale
	 * @param {string} selectedMetadataId the ID of the metadata item to select
	 */
	const setSelectedMetadata = useCallback(
		(selectedMetadataId) => {
			dispatch({ type: actionTypes.SET_SELECTED_METADATA, selectedMetadataId })
			removeAllNotifications()
			refetchMetadataItem(selectedMetadataId)
		},
		[refetchMetadataItem, removeAllNotifications]
	)

	const value = useMemo(() => {
		const { metadataList, selectedMetadataIdx, ...rest } = state
		const selectedMetadata = metadataList[selectedMetadataIdx]
		return {
			metadataList,
			selectedMetadata,
			updateMetadataList,
			updateMetadataItem,
			setSelectedMetadata,
			refreshCurrentMetadata,
			...rest
		}
	}, [
		state,
		updateMetadataItem,
		updateMetadataList,
		setSelectedMetadata,
		refreshCurrentMetadata
	])

	return <MetadataContext.Provider value={value}>{children}</MetadataContext.Provider>
}

export default MetadataProvider
