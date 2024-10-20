# Matching Service Guide

> Please ensure that you have completed the backend set-up [here](../README.md) before proceeding.

## Setting-up Matching Service

1. In the `matching-service` directory, create a copy of the `.env.sample` file and name it `.env`. If you are looking to run matching service with the other services using docker-compose, comment out the variable `RABBITMQ_ADDR` under use case (1) in the .env file. Otherwise, if you are looking to run matching service individually, comment out the variables `RABBITMQ_DEFAULT_USER`, `RABBITMQ_DEFAULT_PASS` and `RABBITMQ_ADDR` under use case (2) in the .env file.

2. If you are running matching service together with other services using docker-compose, to set up credentials for RabbitMq, update the RabbitMq variables in the `.env` file. Update `RABBITMQ_DEFAULT_USER` and `RABBITMQ_DEFAULT_PASS` to what you want, then update `RABBITMQ_ADDR` to be `amqp://<RABBITMQ_DEFAULT_USER>:<RABBITMQ_DEFAULT_PASS>@rabbitmq:5672`. You can access RabbitMq management user interface locally with the username in `RABBITMQ_DEFAULT_USER` and password in `RABBITMQ_DEFAULT_PASS` at http://localhost:15672.

3. If you are running matching service individually, you do not need to make any changes to `RABBITMQ_ADDR`. You can access RabbitMq management user interface locally with the username `guest` and password `guest` at http://localhost:15672.

## Running Matching Service Individually with Docker

1. Set up and run RabbitMq locally on your computer with the command `docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4.0-management`.

2. Open Command Line/Terminal and navigate into the `matching-service` directory.

3. Run the command: `npm install`. This will install all the necessary dependencies.

4. Run the command `npm start` to start the Matching Service in production mode, or use `npm run dev` for development mode, which includes features like automatic server restart when you make code changes. If you encounter connection errors, please wait for a few minutes before running `npm start` again as RabbitMq may take some time to start up.

## After running

1. To view Matching Service documentation, go to http://localhost:3002/docs.

2. Using applications like Postman, you can interact with the Matching Service on port 3002. If you wish to change this, please update the `.env` file.
