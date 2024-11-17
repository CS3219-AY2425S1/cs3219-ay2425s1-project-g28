import amqplib, { Connection } from "amqplib";
import dotenv from "dotenv";
import { matchUsers } from "../handlers/matchHandler";
import { Complexities, Categories, Languages } from "../utils/constants";
import { MatchRequest, MatchRequestItem } from "../utils/types";

dotenv.config();

const RABBITMQ_ADDR = process.env.RABBITMQ_ADDR || "amqp://localhost:5672";
const QUEUE_NAME_DELIMITER = "_";

let mrConnection: Connection;
const waitingLists = new Map<string, Map<string, MatchRequestItem>>();

export const connectToRabbitMq = async () => {
  try {
    mrConnection = await amqplib.connect(RABBITMQ_ADDR);
    const queues = setUpQueueNames();
    for (const queue of queues) {
      await setUpConsumer(queue);
      getWaitingList(queue);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export const sendToProducer = async (
  matchRequest: MatchRequest,
  requestId: string,
  rejectedPartnerId?: string
): Promise<boolean> => {
  const { user, complexity, category, language, timeout } = matchRequest;

  const requestItem: MatchRequestItem = {
    id: requestId,
    user: user,
    sentTimestamp: Date.now(),
    ttlInSecs: timeout,
    rejectedPartnerId: rejectedPartnerId,
  };

  const sent = await routeToQueue(
    [complexity, category, language],
    requestItem
  );
  return sent;
};

const setUpConsumer = async (queueName: string) => {
  const consumerChannel = await mrConnection.createChannel();
  await consumerChannel.assertQueue(queueName, { durable: true });

  consumerChannel.consume(queueName, (msg) => {
    if (msg !== null) {
      const matchRequestItem = JSON.parse(
        msg.content.toString()
      ) as MatchRequestItem;
      const waitingList = getWaitingList(queueName);
      const [complexity, category] = deconstructQueueName(queueName);
      console.log(
        `Consumed from ${queueName}: ${JSON.stringify(matchRequestItem)}`
      );
      console.log(
        `Waiting list before matching: ${JSON.stringify([
          ...waitingList.entries(),
        ])}`
      );
      matchUsers(matchRequestItem, waitingList, complexity, category);
      console.log(
        `Waiting list after matching: ${JSON.stringify([
          ...waitingList.entries(),
        ])}`
      );
      consumerChannel.ack(msg);
    }
  });
};

const routeToQueue = async (
  criterias: string[],
  requestItem: MatchRequestItem
): Promise<boolean> => {
  try {
    const queueName = constructQueueName(criterias);
    const senderChannel = await mrConnection.createChannel();
    const msg = JSON.stringify(requestItem);
    senderChannel.sendToQueue(queueName, Buffer.from(msg), {
      persistent: true,
    });
    console.log(`Sent to ${queueName}: ${msg}`);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const setUpQueueNames = () => {
  const queues = [];
  for (const complexity of Object.values(Complexities)) {
    for (const category of Object.values(Categories)) {
      for (const language of Object.values(Languages)) {
        const queueName = constructQueueName([complexity, category, language]);
        queues.push(queueName);
      }
    }
  }
  return queues;
};

const constructQueueName = (criterias: string[]) => {
  return criterias.join(QUEUE_NAME_DELIMITER);
};

const deconstructQueueName = (queueName: string) => {
  return queueName.split(QUEUE_NAME_DELIMITER);
};

const getWaitingList = (queueName: string): Map<string, MatchRequestItem> => {
  if (!waitingLists.has(queueName)) {
    waitingLists.set(queueName, new Map<string, MatchRequestItem>());
  }
  return waitingLists.get(queueName)!;
};
