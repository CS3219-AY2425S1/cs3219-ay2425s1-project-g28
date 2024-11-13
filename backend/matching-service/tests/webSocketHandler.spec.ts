import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import ioc from "socket.io-client";
import { Server, Socket } from "socket.io";
import { MatchEvents } from "../src/handlers/websocketHandler";
import { MatchUser } from "../src/utils/types";

describe("Matching service web socket", () => {
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

  it("Match found", (done) => {
    const matchIdSent = "123";
    const user1Sent = {
      id: "456",
      username: "user1",
    };
    const user2Sent = {
      id: "789",
      username: "user2",
    };
    clientSocket.on(
      MatchEvents.MATCH_FOUND,
      ({
        matchId,
        user1,
        user2,
      }: {
        matchId: string;
        user1: MatchUser;
        user2: MatchUser;
      }) => {
        expect(matchId).toEqual(matchIdSent);
        expect(user1).toEqual(user1Sent);
        expect(user2).toEqual(user2Sent);
        done();
      }
    );
    serverSocket.emit(MatchEvents.MATCH_FOUND, {
      matchId: matchIdSent,
      user1: user1Sent,
      user2: user2Sent,
    });
  });

  it("Match successful", (done) => {
    const questionIdSent = "123";
    const questionTitleSent = "456";
    clientSocket.on(
      MatchEvents.MATCH_SUCCESSFUL,
      ({
        questionId,
        questionTitle,
      }: {
        questionId: string;
        questionTitle: string;
      }) => {
        expect(questionId).toEqual(questionIdSent);
        expect(questionTitle).toEqual(questionTitleSent);
        done();
      }
    );
    serverSocket.emit(MatchEvents.MATCH_SUCCESSFUL, {
      questionId: questionIdSent,
      questionTitle: questionTitleSent,
    });
  });

  it("Match unsuccessful", (done) => {
    clientSocket.on(MatchEvents.MATCH_UNSUCCESSFUL, () => {
      done();
    });
    serverSocket.emit(MatchEvents.MATCH_UNSUCCESSFUL);
  });

  it("Match request exists", (done) => {
    clientSocket.on(MatchEvents.MATCH_REQUEST_EXISTS, () => {
      done();
    });
    serverSocket.emit(MatchEvents.MATCH_REQUEST_EXISTS);
  });

  it("Match request error", (done) => {
    clientSocket.on(MatchEvents.MATCH_REQUEST_ERROR, () => {
      done();
    });
    serverSocket.emit(MatchEvents.MATCH_REQUEST_ERROR);
  });
});
