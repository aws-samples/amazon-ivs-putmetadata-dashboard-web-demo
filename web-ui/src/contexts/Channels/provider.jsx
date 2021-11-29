import React, { useCallback, useMemo, useReducer } from 'react'
import axios from 'axios'

import ChannelsContext from './context'
import useNotifications from '../Notifications/useNotifications'

import { getApiUrlBase } from '../../utils/helpers'

/*
	Example Channel object:

	{
		arn: 'arn:aws:ivs:us-west-2:123456789123:channel/a1b2c3d4e5f6',
		name: 'my_channel',
		latencyMode: 'LOW',
		authorized: false,
		recordingConfigurationArn: '',
		tags: {}
	}
*/

const initialState = {
	selectedChannel: null,
	channelList: []
}

const actionTypes = {
	UPDATE_CHANNELS: 'UPDATE_CHANNELS',
	SET_SELECTED_CHANNEL: 'SET_SELECTED_CHANNEL'
}

const reducer = (state, action) => {
	switch (action.type) {
		case actionTypes.UPDATE_CHANNELS:
			const { channelList } = action
			return {
				channelList: channelList,
				selectedChannel: state.selectedChannel ?? channelList[0]
			}
		case actionTypes.SET_SELECTED_CHANNEL: {
			return { ...state, selectedChannel: action.selectedChannel }
		}
		default:
			throw new Error('Unexpected action type')
	}
}

const ChannelsProvider = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, initialState)
	const { notifyError } = useNotifications()

	const updateChannels = useCallback(async () => {
		try {
			const response = await axios(`${getApiUrlBase()}channels`)
			const channelList = response.data.channels.map((channel) => {
				const { arn } = channel
				const id = arn.substring(arn.indexOf('channel'))
				return { ...channel, id }
			})
			dispatch({
				type: actionTypes.UPDATE_CHANNELS,
				channelList
			})
		} catch (err) {
			console.error(err)
			notifyError('Unable to retrieve channels')
		}
	}, [notifyError])

	const setSelectedChannel = useCallback((selectedChannel) => {
		dispatch({ type: actionTypes.SET_SELECTED_CHANNEL, selectedChannel })
	}, [])

	const value = useMemo(
		() => ({ ...state, updateChannels, setSelectedChannel }),
		[state, updateChannels, setSelectedChannel]
	)

	return <ChannelsContext.Provider value={value}>{children}</ChannelsContext.Provider>
}

export default ChannelsProvider
