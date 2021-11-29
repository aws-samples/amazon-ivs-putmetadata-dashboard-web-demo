import { useEffect, useRef } from 'react'

export const useEffectAfterMount = (callback, dependencies) => {
	const firstRender = useRef(true)

	useEffect(() => {
		if (!firstRender.current) {
			return callback()
		}
		firstRender.current = false
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, dependencies)
}

export const usePrevious = (value) => {
	const ref = useRef()

	useEffect(() => {
		ref.current = value
	}, [value])

	return ref.current
}

export const useEffectAllDepsChange = (callback, dependencies) => {
	const prevDeps = usePrevious(dependencies)
	const changeTarget = useRef()

	useEffect(() => {
		if (changeTarget.current === undefined) {
			changeTarget.current = prevDeps
			return callback()
		}

		const allDepsChanged = changeTarget.current.every(
			(dependency, i) => dependency !== dependencies[i]
		)
		if (allDepsChanged) {
			changeTarget.current = dependencies
			return callback()
		}
	}, [callback, dependencies, prevDeps])
}
