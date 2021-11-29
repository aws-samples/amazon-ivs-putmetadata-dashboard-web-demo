# PutMetaData Dashboard Web Demo

## Prerequisites

* [NodeJS](https://nodejs.org/)
* Npm is installed with Node.js
* PutMetaData Dashboard Serverless app (Please refer to serverless/README.md for details on back-end configuration)

### Required Configuration

Create a file named `.env` inside the web-ui project directory containing the `ApiURL` from the [serverless app](../serverless).

Replace `<server-endpoint>` with your `ApiURL`.

```
echo "REACT_APP_PUT_METADATA_API='<server-endpoint>'" > .env
```

## Running the demo

To run this app, follow these instructions:

1. [Install NodeJS](https://nodejs.org/). Download latest LTS version ("Recommended for Most Users")
2. Navigate to the web-ui project directory on your local computer.
3. Run: `npm install`
4. Run: `npm start`
5. Open your web browser and navigate to the following URL: http://localhost:3000/

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
