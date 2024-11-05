# Question Service Guide

> Please ensure that you have completed the backend set-up [here](../README.md) before proceeding.

## Setting-up Question Service

1. In the `question-service` directory, create a copy of the `.env.sample` file and name it `.env`.

2. To connect to your cloud MongoDB instead of your local MongoDB, set the `NODE_ENV` to `production` instead of `development`.

3. Update the following variables in the `.env` file:

   - `FIREBASE_PROJECT_ID`

   - `FIREBASE_PRIVATE_KEY`

   - `FIREBASE_CLIENT_EMAIL`

   - `FIREBASE_STORAGE_BUCKET`

   - `MONGO_CLOUD_URI`

   You can also update `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD` to change your MongoDB credentials if necessary.

4. You can view the MongoDB collections locally using Mongo Express. To set up Mongo Express, update `ME_CONFIG_BASICAUTH_USERNAME` and `ME_CONFIG_BASICAUTH_PASSWORD`. The username and password will be the login credentials when you access Mongo Express at http://localhost:8081.

## Running Question Service Locally

> Make sure you have the cloud MongoDB URI in your `.env` file and set `NODE_ENV` to `production` already.

1. Open Command Line/Terminal and navigate into the `question-service` directory.

2. Run the command: `npm install`. This will install all the necessary dependencies.

3. Run the command `npm start` to start the Question Service in production mode, or use `npm run dev` for development mode, which includes features like automatic server restart when you make code changes.

## Running Question Service with Docker

1. Open the Command Line/Terminal.

2. Run the command `docker compose run question-service` to start up the Question Service and its dependencies.

## Seeding questions into MongoDB

1. With Docker

   - Run `docker ps` to get a list of the Docker containers on your machine.
   - Retrieve the `CONTAINER_ID` of `peerprep/question-service`.
   - Run `docker exec -it <CONTAINER_ID> npm run seed`.

2. Without Docker

   - Run `npm run seed`.

## After running

1. To view Question Service documentation, go to http://localhost:3000/docs.

2. Using applications like Postman, you can interact with the Question Service on port 3000. If you wish to change this, please update the `.env` file.
