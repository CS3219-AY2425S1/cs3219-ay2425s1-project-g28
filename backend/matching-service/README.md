# Matching Service Guide

> Please ensure that you have completed the backend set-up [here](../README.md) before proceeding.

## Setting-up Matching Service

1. In the `matching-service` directory, create a copy of the `.env.sample` file and name it `.env`.

2. You can access RabbitMq management user interface locally with `RABBITMQ_DEFAULT_USER` as the username and `RABBITMQ_DEFAULT_PASS` as the password at http://localhost:15672. You may update `RABBITMQ_DEFAULT_USER` and `RABBITMQ_DEFAULT_PASS` in the `.env` file to change your RabbitMq credentials if necessary.

## Running Matching Service Locally

1. Set up and run RabbitMq using `docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4.0-management`.

2. Comment out `RABBITMQ_ADDR` in the `.env` file. You can access RabbitMq management user interface locally with the username `guest` and password `guest` at http://localhost:15672.

3. Open Command Line/Terminal and navigate into the `matching-service` directory.

4. Run the command: `npm install`. This will install all the necessary dependencies.

5. Run the command `npm start` to start the Matching Service in production mode, or use `npm run dev` for development mode, which includes features like automatic server restart when you make code changes. If you encounter connection errors, please wait for a few minutes before running `npm start` again as RabbitMq may take some time to start up.

## Running Matching Service with Docker

1. Open the Command Line/Terminal.

2. Run the command `docker compose run matching-service` to start up the Matching Service and its dependencies.

## After running

1. To view Matching Service documentation, go to http://localhost:3002/docs.

2. Using applications like Postman, you can interact with the Matching Service on port 3002. If you wish to change this, please update the `.env` file.
