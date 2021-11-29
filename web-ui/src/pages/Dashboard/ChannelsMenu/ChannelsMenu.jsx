import useChannels from '../../../contexts/Channels/useChannels'

import './ChannelsMenu.css'

const ChannelsMenu = () => {
	const { channelList, selectedChannel, setSelectedChannel } = useChannels()

	const handleChannelChange = (e) => {
		const id = e.target.value
		const channel = channelList.find(({ arn }) => arn.includes(id))
		setSelectedChannel(channel)
	}

	return (
		<select
			id="selected_channel"
			name="selected_channel"
			value={selectedChannel?.id ?? ''}
			onChange={handleChannelChange}
			className="channels-dropdown mg-r-1"
		>
			{channelList.map(({ id, name }) => (
				<option key={id} value={id}>
					{name}
				</option>
			))}
		</select>
	)
}

export default ChannelsMenu
