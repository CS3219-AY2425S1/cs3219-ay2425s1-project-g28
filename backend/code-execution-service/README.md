# Code Execution Service Guide

## Setting-up Code Execution Service

1. In the `code-execution-service` directory, create a copy of the `.env.sample` file and name it `.env`.

2. Sign up for a free OneCompiler API [here](https://rapidapi.com/onecompiler-onecompiler-default/api/onecompiler-apis).

3. Update `ONE_COMPILER_KEY` in `.env` with the the value of `x-rapidapi-key`.

## Running Code Execution Service without Docker

1. Open Command Line/Terminal and navigate into the `code-execution-service` directory.

2. Run the command: `npm install`. This will install all the necessary dependencies.

3. Run the command `npm start` to start the Code Execution Service in production mode, or use `npm run dev` for development mode, which includes features like automatic server restart when you make code changes.

## After running

1. To view Code Execution Service documentation, go to http://localhost:3004/docs.

2. Using applications like Postman, you can interact with the Code Execution Service on port 3004. If you wish to change this, please update the `.env` file.
