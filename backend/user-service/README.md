# User Service Guide

> Please ensure that you have completed the backend set-up [here](../README.md) before proceeding.

## Setting-up User Service

1. In the `user-service` directory, create a copy of the `.env.sample` file and name it `.env`.

2. To connect to your cloud MongoDB instead of your local MongoDB, set the `NODE_ENV` to `production` instead of `development`.

3. Update the following variables in the `.env` file:

   - `JWT_SECRET`

   - `FIREBASE_PROJECT_ID`

   - `FIREBASE_PRIVATE_KEY`

   - `FIREBASE_CLIENT_EMAIL`

   - `FIREBASE_STORAGE_BUCKET`

   - `SERVICE`: Email service to use to send account verification links, e.g. `gmail`.

   - `USER`: Email address that you will be using, e.g. `johndoe@gmail.com`.

   - `PASS`: The app password. For gmail accounts, please refer to this [link](https://support.google.com/accounts/answer/185833?hl=en).

   - `REDIS_URI`

   - `MONGO_CLOUD_URI`

   You can also update `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD` to change your MongoDB credentials if necessary.

4. You can view the MongoDB collections locally using Mongo Express. To set up Mongo Express, update `ME_CONFIG_BASICAUTH_USERNAME` and `ME_CONFIG_BASICAUTH_PASSWORD`. The username and password will be the login credentials when you access Mongo Express at http://localhost:8082.

5. A default admin account (`email: admin@gmail.com` and `password: Admin@123`) wil be created. If you wish to change the default credentials, update them in `.env`. Alternatively, you can also edit your credentials and user profile after you have created the default account.

## Running User Service Locally

> Make sure you have the cloud MongoDB URI in your `.env` file and set `NODE_ENV` to `production` already.

1. Set up and run Redis using `docker compose run --rm --name user-service-redis -p 6379:6379 user-service-redis`.

2. Comment out `REDIS_URI` in the `.env` file.

3. Open Command Line/Terminal and navigate into the `user-service` directory.

4. Run the command: `npm install`. This will install all the necessary dependencies.

5. Run the command `npm start` to start the User Service in production mode, or use `npm run dev` for development mode, which includes features like automatic server restart when you make code changes.

## Running User Service with Docker

1. Open the Command Line/Terminal.

2. Run the command `docker compose run user-service` to start up the User Service and its dependencies.

## After running

1. To view User Service documentation, go to http://localhost:3001/docs.

2. Using applications like Postman, you can interact with the User Service on port 3001. If you wish to change this, please update the `.env` file.
