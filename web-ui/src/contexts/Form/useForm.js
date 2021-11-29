import { useContext } from 'react'
import FormContext from './context'

const useForm = () => {
	const context = useContext(FormContext)

	if (!context) {
		throw new Error('Form context must be consumed inside the Form Provider')
	}

	return context
}

export default useForm
