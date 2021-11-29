// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react'

import useNotifications from '../../contexts/Notifications/useNotifications'
import { ReactComponent as CheckmarkIcon } from '../../assets/checkmark.svg'
import { ReactComponent as ErrorIcon } from '../../assets/error.svg'

import './Notifications.css'

const Notifications = () => {
	const { notifications } = useNotifications()

	const renderIcon = (type) => {
		switch (type) {
			case 'success': {
				return <CheckmarkIcon />
			}
			case 'error': {
				return <ErrorIcon />
			}
			default:
				return null
		}
	}

	return (
		<div className="notifications-container">
			{notifications.map(({ message, type, id }) => (
				<div key={id} className={`notice notice--${type} fadeIn mg-b-1`}>
					<div className={`notice__content notice-${type}-text`}>
						<div className="icon icon--24 notice__icon">{renderIcon(type)}</div>
						<p>{message}</p>
					</div>
				</div>
			))}
		</div>
	)
}

export default Notifications
