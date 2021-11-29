import React, { useEffect } from 'react'
import PropTypes from 'prop-types'

import Editor, { getUserEvent } from '../../../components/Editor'
import ChannelsMenu from '../ChannelsMenu'
import { ReactComponent as WarningIcon } from '../../../assets/warning.svg'

import useForm from '../../../contexts/Form/useForm'
import useMetadata from '../../../contexts/Metadata/useMetadata'
import useNotifications from '../../../contexts/Notifications/useNotifications'
import useModal from '../../../contexts/Modal/useModal'

import config from '../../../config'
import { calculateByteLength, formatByteLength } from '../../../utils/helpers'

import './MetadataForm.css'

const MetadataForm = ({ sendMetadata, updateMetadata, deleteMetadata }) => {
	const { selectedMetadata, isStale, refreshCurrentMetadata } = useMetadata()
	const { notifyError } = useNotifications()
	const { showModal } = useModal()
	const { formData, setFormData, isFormDirty } = useForm()

	const isFormDisabled = !selectedMetadata
	const isSaveDisabled = !isStale && (isFormDisabled || !isFormDirty || !formData.title)
	const isSendDisabled = isFormDisabled || !formData.title || !formData.metadata

	useEffect(() => {
		if (selectedMetadata) {
			setFormData({
				title: selectedMetadata.Title,
				metadata: selectedMetadata.Metadata
			})
		}
	}, [selectedMetadata, setFormData])

	const jsonParseLinter = (json) => {
		if (json) {
			try {
				JSON.parse(json)
			} catch (e) {
				notifyError(e.message)
				return false
			}
		}
		return true
	}

	const handleSave = (e) => {
		e.preventDefault()
		if (jsonParseLinter(formData.metadata)) {
			updateMetadata(formData)
		}
	}

	const handleSend = (e) => {
		e.preventDefault()
		if (jsonParseLinter(formData.metadata)) {
			sendMetadata(formData)
			if (isFormDirty) {
				updateMetadata(formData)
			}
		}
	}

	const handleDelete = (e) => {
		e.preventDefault()
		showModal('Are you sure you would like to delete this TimedMetadata?', {
			callback: deleteMetadata,
			buttonType: 'destruct',
			buttonText: 'Delete'
		})
	}

	const handleEditorUpdate = (viewUpdate) => {
		const userEvent = getUserEvent(viewUpdate.transactions[0])
		if (userEvent === 'input.paste' && !viewUpdate.docChanged) {
			notifyError(
				'The text was not pasted since it will exceed the maximum TimedMetadata size'
			)
		}
	}

	return (
		<div className="metadata-editor">
			<section className="pd-t-2">
				<div className="fl fl-j-between fl-a-center">
					<h2 className="mg-y-2">TimedMetadata</h2>
					<div className="fl fl-a-center button-container">
						{isStale && (
							<>
								<div className="icon icon--24 icon--error mg-r-1">
									<WarningIcon />
								</div>
								<button
									type="button"
									className="btn btn--secondary pd-x-2"
									onClick={() => refreshCurrentMetadata()}
								>
									Refresh
								</button>
							</>
						)}
						<button
							className="btn btn--secondary pd-x-2"
							disabled={isFormDisabled}
							onClick={handleDelete}
						>
							Delete
						</button>
						<button
							type="button"
							className={`btn btn--secondary pd-x-2`}
							disabled={isSaveDisabled}
							onClick={handleSave}
						>
							Save
						</button>
					</div>
				</div>
				<form>
					<fieldset className="mg-b-2">
						<input
							type="text"
							value={formData.title}
							placeholder="Title/Name"
							onChange={(e) => setFormData({ title: e.target.value })}
							disabled={isFormDisabled}
							className="form-control"
							maxLength={160}
							required
						/>
						<label className="mg-t-1 mg-b-2">
							{/* Size with whitespace */}
							<strong>{formatByteLength(Buffer.byteLength(formData.metadata))}</strong>
							&nbsp;
							{/* Size without whitespace */}
							<span>{formatByteLength(calculateByteLength(formData.metadata))}</span>
						</label>
						<Editor
							value={formData.metadata}
							onChange={(metadata) => setFormData({ metadata })}
							onUpdate={handleEditorUpdate}
							placeholder="Type here..."
							height="500px"
							width="700px"
							editable={!isFormDisabled}
							maxByteLength={config.MAX_BYTE}
						/>
						<div className="fl fl-j-end mg-t-1">
							<ChannelsMenu />
							<button
								type="button"
								className="btn btn--primary pd-x-2"
								disabled={isSendDisabled}
								onClick={handleSend}
							>
								Send
							</button>
						</div>
					</fieldset>
				</form>
			</section>
		</div>
	)
}

MetadataForm.propTypes = {
	sendMetadata: PropTypes.func,
	updateMetadata: PropTypes.func,
	deleteMetadata: PropTypes.func
}

export default MetadataForm
