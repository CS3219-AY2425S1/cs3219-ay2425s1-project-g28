# User Service Guide

> Please ensure that you have completed the backend set-up [here](../README.md) before proceeding.

## Setting-up User Service

1. In the `user-service` directory, create a copy of the `.env.sample` file and name it `.env`.

2. To connect to your cloud MongoDB instead of your local MongoDB, set the `NODE_ENV` to `production` instead of `development`.

3. Update `MONGO_CLOUD_URI`, `MONGO_LOCAL_URI`, `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_STORAGE_BUCKET`, `JWT_SECRET`.

4. A default admin account (`email: admin@gmail.com` and `password: Admin@123`) wil be created. If you wish to change the default credentials, update them in `.env`. Alternatively, you can also edit your credentials and user profile after you have created the default account.

## Running User Service without Docker

1. Open Command Line/Terminal and navigate into the `user-service` directory.

2. Run the command: `npm install`. This will install all the necessary dependencies.

3. Run the command `npm start` to start the User Service in production mode, or use `npm run dev` for development mode, which includes features like automatic server restart when you make code changes.

## After running

1. To view User Service documentation, go to http://localhost:3001/docs.

2. Using applications like Postman, you can interact with the User Service on port 3001. If you wish to change this, please update the `.env` file.
