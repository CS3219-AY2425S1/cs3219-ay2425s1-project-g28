# Collab Service Guide

## Setting-up Collab Service

1. In the `collab-service` directory, create a copy of the `.env.sample` file and name it `.env`.

2. Update the following variable in the `.env` file:

   - `REDIS_URI`

## Running Collab Service Individually

1. Set up and run Redis using `docker compose run --rm --name redis -p 6379:6379 redis`.

2. Open Command Line/Terminal and navigate into the `collab-service` directory.

3. Run the command: `npm install`. This will install all the necessary dependencies.

4. Run the command `npm start` to start the Collab Service in production mode, or use `npm run dev` for development mode, which includes features like automatic server restart when you make code changes.

## Running Collab Service Individually with Docker

1. Open the command line/terminal.

2. Run the command `docker compose run collab-service` to start up the collab service and its dependencies.

## After running

1. Using applications like Postman, you can interact with the Collab Service on port 3003. If you wish to change this, please update the `.env` file.

2. Setting up Socket.IO connection on Postman:
   - You should open 2 tabs on Postman to simulate 2 users in the Collab Service.

   - Select the `Socket.IO` option and set URL to `http://localhost:3003`. Click `Connect`.
   ![image1.png](docs/image1.png)
   
   - Add the following events in the `Events` tab and listen to them.
   ![image2.png](docs/image2.png)
   
   - To send a message, go to the `Message` tab and ensure that your message is being parsed as `JSON`.
   ![image3.png](docs/image3.png)
   
   - In the `Event name` input, input the correct event name. Click on `Send` to send a message.
   ![image4.png](docs/image4.png)

## Events Available   
| Event Name     | Description                       | Parameters                                                                    | Response Event                                                                                                                                                                                                           |
|----------------|-----------------------------------|-------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **join**       | Joins a collaboration room.       | `roomId` (string): ID of the room.                                            | **room_full:** Notify the user if the room is full (only 2 users allowed).<br/>**connected:** Notify the user if successfully connected.<br/>**new_user_connected:** Notify the other user if a new user joins the room. |
| **change**     | Sends updated code to other user. | `roomId` (string): ID of the room.<br/>`code` (string): Updated code content. | **code_change:** Notify the other user with the updated code content.                                                                                                                                                    |
| **leave**      | Leaves the collaboration room.    | `roomId` (string): ID of the room.                                            | **partner_left:** Notify the other user when one leaves the room.                                                                                                                                                        |
| **disconnect** | Disconnects from the server.      | None                                                                          | **partner_disconnected:** Notify the other user when one is disconnected.                                                                                                                                                |