import { EditorView } from '@codemirror/view'
import { tags, HighlightStyle } from '@codemirror/highlight'

const colors = {
	json: {
		propertyName: '#7347C3',
		string: '#33547E',
		number: '#1063C7',
		bool: '#2E91BA'
	},
	editor: {
		bg: '#F1F2F3',
		focus: '#FFA723',
		active: '#DFE5E9',
		black: '#000'
	}
}

export const defaultStyling = (editable) =>
	EditorView.theme({
		'&': {
			overflow: 'auto',
			background: colors.editor.bg,
			borderRadius: '4px',
			transform: 'translateZ(0)'
		},
		'&.cm-focused': {
			outline: 'none',
			borderRadius: '4px',
			boxShadow: `0 0 0 2px ${colors.editor.focus}`
		},
		'.cm-gutters': {
			background: colors.editor.bg
		},
		'.cm-activeLine': {
			background: colors.editor.active
		},
		'.cm-activeLineGutter': {
			color: editable && colors.editor.black,
			background: 'transparent'
		},
		'.cm-matchingBracket': {
			borderBottom: `1px solid ${colors.editor.black}`,
			background: 'transparent'
		},
		'&.cm-focused .cm-selectionBackground, ::selection': {
			background: colors.editor.focus,
			opacity: 0.5
		},

		/* non-editable editor styles */

		'.cm-content[contenteditable=false]': {
			opacity: 0.5,
			userSelect: 'none'
		},
		'.cm-content[contenteditable=false] .cm-activeLine': {
			background: 'transparent'
		},
		'.cm-content[contenteditable=false] .cm-selectionMatch': {
			background: 'transparent'
		},
		'.cm-content[contenteditable=false] .cm-matchingBracket': {
			background: 'transparent',
			border: 'none'
		}
	})

export const defaultHighlighting = HighlightStyle.define([
	{ tag: tags.propertyName, color: colors.json.propertyName, fontWeight: 'bold' },
	{ tag: tags.string, color: colors.json.string, fontWeight: 'bold' },
	{ tag: tags.number, color: colors.json.number, fontWeight: 'bold' },
	{ tag: tags.bool, color: colors.json.bool, fontWeight: 'bold' }
])
