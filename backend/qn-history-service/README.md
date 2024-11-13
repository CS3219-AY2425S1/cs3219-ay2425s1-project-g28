# Question History Service Guide

> Please ensure that you have completed the backend set-up [here](../README.md) before proceeding.

## Setting-up Question History Service

1. In the `qn-history-service` directory, create a copy of the `.env.sample` file and name it `.env`.

2. To connect to your cloud MongoDB instead of your local MongoDB, set the `NODE_ENV` to `production` instead of `development`.

3. Update the following variable in the `.env` file:

   - `MONGO_CLOUD_URI`

   You can also update `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD` to change your MongoDB credentials if necessary.

4. You can view the MongoDB collections locally using Mongo Express. To set up Mongo Express, update `ME_CONFIG_BASICAUTH_USERNAME` and `ME_CONFIG_BASICAUTH_PASSWORD`. The username and password will be the login credentials when you access Mongo Express at http://localhost:8083.

## Running Question History Service Locally

> Make sure you have the cloud MongoDB URI in your `.env` file and set `NODE_ENV` to `production` already.

1. Open Command Line/Terminal and navigate into the `qn-history-service` directory.

2. Run the command: `npm install`. This will install all the necessary dependencies.

3. Run the command `npm start` to start the Question History Service in production mode, or use `npm run dev` for development mode, which includes features like automatic server restart when you make code changes.

## Running Question History Service with Docker

1. Open the Command Line/Terminal.

2. Run the command `docker compose run qn-history-service` to start up the Question History Service and its dependencies.

## After running

1. To view Question History Service documentation, go to http://localhost:3006/docs.

2. Using applications like Postman, you can interact with the Question History Service on port 3006. If you wish to change this, please update the `.env` file.
