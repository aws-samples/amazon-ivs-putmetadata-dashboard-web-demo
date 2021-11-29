import { useContext } from 'react';
import MetadataContext from './context';

const useMetadata = () => {
	const context = useContext(MetadataContext);

	if (!context) {
		throw new Error(
			'Metadata context must be consumed inside the Metadata Provider'
		);
	}

	return context;
};

export default useMetadata;
