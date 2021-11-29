import config from '../config'

export const calculateByteLength = (str) => {
	if (!str) return 0

	// Remove whitespaces and line breaks
	let metadata = str
		.replace(/^\s+|\s+$/gm, '') // Trim beginning and ending whitespaces
		.replace(/(\r\n|\n|\r)/gm, '') // Remove line breaks
		.replace(/\s+/g, ' ') // Remove double whitespaces

	// Check size
	return Buffer.byteLength(metadata, 'utf8')
}

export const formatByteLength = (byteLength) => {
	return byteLength >= 1000
		? `(${(byteLength / 1000).toFixed(2)} KB)`
		: `(${byteLength} B)`
}

export const getApiUrlBase = () => {
	let urlBase = `${config.PUT_METADATA_API}`
	if (config.PUT_METADATA_API.charAt(config.PUT_METADATA_API.length - 1) !== '/') {
		urlBase += '/'
	}
	return urlBase
}
