// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect } from 'react'
import axios from 'axios'

import MetadataList from './MetadataList'
import Notifications from '../../components/Notifications'
import MetadataForm from './MetadataForm'
import Modal from '../../components/Modal'

import FormProvider from '../../contexts/Form/provider'
import useChannels from '../../contexts/Channels/useChannels'
import useNotifications from '../../contexts/Notifications/useNotifications'
import useMetadata from '../../contexts/Metadata/useMetadata'

import { getApiUrlBase } from '../../utils/helpers'

import './Dashboard.css'

const Dashboard = () => {
	const { metadataList, selectedMetadata, updateMetadataList } = useMetadata()
	const { selectedChannel, updateChannels } = useChannels()
	const { notifySuccess, notifyError } = useNotifications()

	useEffect(() => {
		updateChannels()
		updateMetadataList()
	}, [updateChannels, updateMetadataList])

	/**
	 * CREATE an empty/untitled timed metadata item
	 */
	const createMetadata = async () => {
		try {
			await axios.post(
				getApiUrlBase(),
				{
					channel: selectedChannel.name,
					title: 'Untitled',
					metadata: ''
				},
				{ headers: { 'Content-Type': 'text/plain' } }
			)
			updateMetadataList(0)
			notifySuccess('TimedMetadata created successfully')
		} catch (err) {
			console.error(err)
			notifyError('Unable to create TimedMetadata')
		}
	}

	/**
	 * UPDATE an existing timed metadata item with the current form data ('metadata' and 'title')
	 * @param {object} formData title and metadata payload of the selected TimedMetadata
	 */
	const updateMetadata = async (formData) => {
		try {
			await axios.post(
				`${getApiUrlBase()}/update`,
				JSON.stringify({
					id: selectedMetadata.Id,
					channel: selectedChannel.name,
					title: formData.title,
					metadata: formData.metadata
				})
			)
			updateMetadataList()
			notifySuccess('TimedMetadata saved successfully')
		} catch (err) {
			console.error(err)
			notifyError('Unable to update TimedMetadata')
		}
	}

	/**
	 * DELETE an existing timed metadata item and update the selected item in the sidebar
	 */
	const deleteMetadata = async () => {
		try {
			const prevMetadataList = metadataList
			const deletedMetadataIdx = metadataList.findIndex(
				(md) => md.Id === selectedMetadata.Id
			)
			await axios.get(`${getApiUrlBase()}/delete?id=${selectedMetadata.Id}`)

			if (prevMetadataList.length > 1) {
				// at least one metadata item remains - select the next earliest item
				updateMetadataList(deletedMetadataIdx - 1)
			} else {
				// the last metadata item was deleted - create a new metadata item
				createMetadata()
			}
			notifySuccess('TimedMetadata deleted successfully')
		} catch (err) {
			console.error(err)
			notifyError('Unable to delete TimedMetadata')
		}
	}

	/**
	 * SEND the selected timed metadata to the currently selected channel.
	 * The metadata is saved/updated with current the formData entries.
	 * @param {object} formData title and metadata of the selected TimedMetadata
	 */
	const sendMetadata = async (formData) => {
		try {
			await axios.post(
				`${getApiUrlBase()}send`,
				JSON.stringify({
					id: selectedMetadata.Id,
					channelArn: selectedChannel.arn,
					metadata: formData.metadata
						.replace(/^\s+|\s+$/gm, '') // Trim beginning and ending whitespaces
						.replace(/(\r\n|\n|\r)/gm, '') // Remove line breaks
						.replace(/\s+/g, ' ') // Remove double whitespaces
				})
			)
			notifySuccess('TimedMetadata sent successfully')
		} catch (err) {
			console.error(err)
			notifyError('Unable to send timedMetadata')
		}
	}

	return (
		<>
			<header>
				<h1>PutMetadata Dashboard</h1>
			</header>
			<Modal />
			<Notifications />
			<div className="app-grid">
				<FormProvider>
					<MetadataList createMetadata={createMetadata} />
					<MetadataForm
						sendMetadata={sendMetadata}
						updateMetadata={updateMetadata}
						deleteMetadata={deleteMetadata}
					/>
				</FormProvider>
			</div>
		</>
	)
}

export default Dashboard
