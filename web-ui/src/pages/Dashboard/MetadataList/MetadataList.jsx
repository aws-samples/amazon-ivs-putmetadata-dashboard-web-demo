import React from 'react'
import PropTypes from 'prop-types'

import { ReactComponent as AddIcon } from '../../../assets/add.svg'

import useMetadata from '../../../contexts/Metadata/useMetadata'
import useForm from '../../../contexts/Form/useForm'
import useModal from '../../../contexts/Modal/useModal'

import './MetadataList.css'

const MetadataList = ({ createMetadata }) => {
	const { metadataList, selectedMetadata, setSelectedMetadata } = useMetadata()
	const { showModal } = useModal()
	const { isFormDirty } = useForm()

	const showUnsavedModal = (cb) => {
		const unsavedModalMessage =
			'You have unsaved TimedMetadata changes. Do you want to continue?'
		showModal(unsavedModalMessage, {
			callback: cb,
			buttonText: 'Continue',
			buttonType: 'confirm'
		})
	}

	const handleAddMetadata = (e) => {
		if (isFormDirty) {
			showUnsavedModal(createMetadata)
		} else {
			createMetadata()
		}
	}

	const handleSelectMetadata = (e, metadataItem) => {
		e.preventDefault()
		if (isFormDirty) {
			showUnsavedModal(() => setSelectedMetadata(metadataItem.Id))
		} else {
			setSelectedMetadata(metadataItem.Id)
		}
	}

	return (
		<div className="metadata-list">
			<div className="metadata-list__scrollable">
				{metadataList?.map((metadataItem) => {
					const { Id, CreatedDate, Title } = metadataItem
					const active = Id === selectedMetadata.Id ? 'interactive--active' : ''
					const date = new Date(parseInt(CreatedDate))
					return (
						<a
							key={Id}
							href="/#"
							className={`interactive ${active}`}
							onClick={(e) => handleSelectMetadata(e, metadataItem)}
						>
							<strong>{Title}</strong>
							<span>{date.toLocaleDateString()}</span>
						</a>
					)
				})}
			</div>
			<button className="btn btn--floating btn--absolute" onClick={handleAddMetadata}>
				<AddIcon style={{ display: 'block', margin: 'auto' }} />
			</button>
		</div>
	)
}

MetadataList.propTypes = {
	createMetadata: PropTypes.func
}

export default MetadataList
