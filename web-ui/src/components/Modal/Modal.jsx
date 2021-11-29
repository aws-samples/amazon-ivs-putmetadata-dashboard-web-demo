// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react'
import useModal from '../../contexts/Modal/useModal'

const Modal = () => {
	const { isVisible, message, confirmAction, hideModal } = useModal()
	const { callback, buttonText, buttonType } = confirmAction || {}

	return (
		isVisible && (
			<div className="modal pos-absolute top-0 bottom-0">
				<div className="modal__el br-all">
					<h2>{message}</h2>
					<div className="grid grid--2 mg-t-1">
						<button className="btn btn--secondary" onClick={hideModal}>
							Cancel
						</button>
						<button className={`btn btn--${buttonType}`} onClick={callback}>
							{buttonText}
						</button>
					</div>
				</div>
				<div className="modal__overlay"></div>
			</div>
		)
	)
}

export default Modal
