import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import ioc from "socket.io-client";
import { Server, Socket } from "socket.io";
import { CollabEvents } from "../src/handlers/websocketHandler";

describe("Collab service web socket", () => {
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

  it("Room ready", (done) => {
    const isRoomReady = true;
    clientSocket.on(
      CollabEvents.ROOM_READY,
      ({ ready }: { ready: boolean }) => {
        expect(ready).toEqual(isRoomReady);
        done();
      }
    );
    serverSocket.emit(CollabEvents.ROOM_READY, {
      ready: isRoomReady,
    });
  });

  it("Document ready", (done) => {
    const questionHistoryIdSent = "123";
    clientSocket.on(
      CollabEvents.DOCUMENT_READY,
      ({ questionHistoryId }: { questionHistoryId: string }) => {
        expect(questionHistoryId).toEqual(questionHistoryIdSent);
        done();
      }
    );
    serverSocket.emit(CollabEvents.DOCUMENT_READY, {
      questionHistoryId: questionHistoryIdSent,
    });
  });

  it("Document not found", (done) => {
    clientSocket.on(CollabEvents.DOCUMENT_NOT_FOUND, () => {
      done();
    });
    serverSocket.emit(CollabEvents.DOCUMENT_NOT_FOUND);
  });

  it("Document update", (done) => {
    const updateSent = new Uint8Array([1, 2, 3]);
    clientSocket.on(
      CollabEvents.UPDATE,
      ({ update }: { update: Uint8Array }) => {
        expect(Array.from(update)).toEqual(Array.from(updateSent));
        done();
      }
    );
    serverSocket.emit(CollabEvents.UPDATE, {
      update: updateSent,
    });
  });

  it("Cursor update", (done) => {
    const uidSent = "123";
    const usernameSent = "user";
    const fromSent = 1;
    const toSent = 5;
    clientSocket.on(
      CollabEvents.UPDATE_CURSOR,
      ({
        uid,
        username,
        from,
        to,
      }: {
        uid: string;
        username: string;
        from: number;
        to: number;
      }) => {
        expect(uid).toEqual(uidSent);
        expect(username).toEqual(usernameSent);
        expect(from).toEqual(fromSent);
        expect(to).toEqual(toSent);
        done();
      }
    );
    serverSocket.emit(CollabEvents.UPDATE_CURSOR, {
      uid: uidSent,
      username: usernameSent,
      from: fromSent,
      to: toSent,
    });
  });

  it("End session", (done) => {
    const sessionDurationSent = 30;
    clientSocket.on(
      CollabEvents.END_SESSION,
      ({ sessionDuration }: { sessionDuration: number }) => {
        expect(sessionDuration).toEqual(sessionDurationSent);
        done();
      }
    );
    serverSocket.emit(CollabEvents.END_SESSION, {
      sessionDuration: sessionDurationSent,
    });
  });

  it("Partner disconnected", (done) => {
    clientSocket.on(CollabEvents.PARTNER_DISCONNECTED, () => {
      done();
    });
    serverSocket.emit(CollabEvents.PARTNER_DISCONNECTED);
  });
});
