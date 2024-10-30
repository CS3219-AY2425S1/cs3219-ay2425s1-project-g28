import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import ioc from "socket.io-client";
import { Server, Socket } from "socket.io";

import { BOT_NAME } from "../src/utils/constants";
import { CommunicationEvents, MessageTypes } from "../src/utils/types";

describe("Communication service web socket", () => {
  let io: Server, serverSocket: Socket, clientSocket: SocketIOClient.Socket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      clientSocket = ioc(`http://localhost:${port}`);
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  it("User joined acknowledgement", (done) => {
    const createdAt = Date.now();
    const messageSent = "User has joined the chat";
    clientSocket.on(
      CommunicationEvents.USER_JOINED,
      ({
        from,
        type,
        message,
        createdTime,
      }: {
        from: string;
        type: string;
        message: string;
        createdTime: number;
      }) => {
        expect(from).toBe(BOT_NAME);
        expect(type).toBe(MessageTypes.BOT_GENERATED);
        expect(message).toBe(messageSent);
        expect(createdTime).toBe(createdAt);
        done();
      }
    );
    serverSocket.emit(CommunicationEvents.USER_JOINED, {
      from: BOT_NAME,
      type: MessageTypes.BOT_GENERATED,
      message: messageSent,
      createdTime: createdAt,
    });
  });

  it("Message received", (done) => {
    const createdAt = Date.now();
    const messageSent = "Hello";
    const username = "user";
    clientSocket.on(
      CommunicationEvents.TEXT_MESSAGE_RECEIVED,
      ({
        from,
        type,
        message,
        createdTime,
      }: {
        from: string;
        type: string;
        message: string;
        createdTime: number;
      }) => {
        expect(from).toBe(username);
        expect(type).toBe(MessageTypes.USER_GENERATED);
        expect(message).toBe(messageSent);
        expect(createdTime).toBe(createdAt);
        done();
      }
    );
    serverSocket.emit(CommunicationEvents.TEXT_MESSAGE_RECEIVED, {
      from: username,
      type: MessageTypes.USER_GENERATED,
      message: messageSent,
      createdTime: createdAt,
    });
  });
});
