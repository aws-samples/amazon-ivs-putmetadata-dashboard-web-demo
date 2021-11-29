// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react'

import MetadataProvider from './contexts/Metadata/provider'
import ChannelsProvider from './contexts/Channels/provider'
import NotificationsProvider from './contexts/Notifications/provider'
import ModalProvider from './contexts/Modal/provider'

import Dashboard from './pages/Dashboard'

const App = () => (
	<div className="App full-width full-height">
		<NotificationsProvider>
			<ModalProvider>
				<MetadataProvider>
					<ChannelsProvider>
						<Dashboard />
					</ChannelsProvider>
				</MetadataProvider>
			</ModalProvider>
		</NotificationsProvider>
	</div>
)

export default App
