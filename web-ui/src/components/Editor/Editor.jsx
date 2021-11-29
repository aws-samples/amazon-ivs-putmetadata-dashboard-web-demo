import React, { useEffect, useRef } from 'react'
import { basicSetup } from '@codemirror/basic-setup'
import { EditorView, keymap, placeholder as extendPlaceholder } from '@codemirror/view'
import { EditorState, StateEffect } from '@codemirror/state'
import { indentWithTab } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'

import { calculateByteLength } from '../../utils/helpers'
import { defaultStyling, defaultHighlighting } from './theme'

const Editor = ({
	value,
	onChange,
	onUpdate,
	maxByteLength,
	autoFocus = false,
	height = '',
	minHeight = '100px',
	maxHeight = '',
	width = '',
	minWidth = '',
	maxWidth = '',
	placeholder = '',
	tabIndent = false,
	editable = true,
	...other
}) => {
	const editor = useRef()
	const state = useRef()
	const view = useRef()

	const dimensions = EditorView.theme({
		'&': {
			height,
			minHeight,
			maxHeight,
			width,
			minWidth,
			maxWidth
		}
	})

	const updateListener = EditorView.updateListener.of((viewUpdate) => {
		if (viewUpdate.docChanged) {
			onChange(viewUpdate.state.doc.toString(), viewUpdate)
		}
	})

	const extensions = [
		basicSetup,
		updateListener,
		dimensions,
		defaultStyling(editable),
		defaultHighlighting,
		json()
	]

	if (tabIndent) {
		extensions.unshift(keymap.of([indentWithTab]))
	}

	if (placeholder) {
		extensions.push(extendPlaceholder(placeholder))
	}

	if (!editable) {
		extensions.push(EditorView.editable.of(false))
	}

	if (onUpdate) {
		extensions.push(EditorView.updateListener.of(onUpdate))
	}

	if (maxByteLength) {
		extensions.push(
			EditorState.changeFilter.of((transaction) => {
				if (transaction.docChanged) {
					const value = transaction.newDoc.toString()
					const byteLength = calculateByteLength(value)
					if (byteLength > maxByteLength) {
						return false
					}
				}
				return true
			})
		)
	}

	useEffect(() => {
		if (editor.current && !state.current) {
			state.current = EditorState.create({
				doc: value,
				extensions: extensions
			})

			if (!view.current) {
				view.current = new EditorView({
					state: state.current,
					parent: editor.current
				})
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editor.current, state.current])

	useEffect(() => {
		if (view.current) {
			const currentValue = view.current.state.doc.toString()
			if (value !== currentValue) {
				view.current.dispatch({
					changes: { from: 0, to: currentValue.length, insert: value || '' }
				})
			}
		}
	}, [value, maxByteLength])

	useEffect(() => {
		if (view.current) {
			view.current.dispatch({ effects: StateEffect.reconfigure.of(extensions) })
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		placeholder,
		height,
		minHeight,
		maxHeight,
		width,
		minWidth,
		maxWidth,
		editable,
		tabIndent
	])

	useEffect(() => {
		if (autoFocus && view.current) {
			view.current.focus()
		}
	}, [autoFocus, view, editable])

	useEffect(() => {
		return () => {
			if (view.current) {
				view.current.destroy()
			}
		}
	}, [])

	return <div ref={editor} {...other}></div>
}

export const getUserEvent = (transaction) => {
	if (transaction) {
		const { annotations } = transaction
		const userEventTypes = ['input', 'delete', 'move', 'select', 'undo', 'redo']
		const regExp = new RegExp(userEventTypes.join('|'))
		const userEvent = annotations.find((annot) => regExp.test(annot.value))
		return userEvent?.value
	}
}

export default Editor
