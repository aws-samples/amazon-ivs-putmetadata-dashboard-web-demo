import { useContext } from 'react';
import ChannelsContext from './context';

const useChannels = () => {
	const context = useContext(ChannelsContext);

	if (!context) {
		throw new Error(
			'Channels context must be consumed inside the Channels Provider'
		);
	}

	return context;
};

export default useChannels;
