import { useContext } from 'react'
import ModalContext from './context'

const useModal = () => {
	const context = useContext(ModalContext)

	if (!context) {
		throw new Error('Modal context must be consumed inside the Modal Provider')
	}

	return context
}

export default useModal
