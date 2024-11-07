import amqplib, { Connection } from "amqplib";
import dotenv from "dotenv";
import { matchUsers } from "../utils/messageQueue";
import { MatchRequestItem } from "../handlers/matchHandler";
import { Complexities, Categories, Languages } from "../utils/constants";

dotenv.config();

const RABBITMQ_ADDR = process.env.RABBITMQ_ADDR || "amqp://localhost:5672";

let mrConnection: Connection;
const queues: string[] = [];
const pendingQueueRequests = new Map<string, Map<string, MatchRequestItem>>();

const initQueueNames = () => {
  for (const complexity of Object.values(Complexities)) {
    for (const category of Object.values(Categories)) {
      for (const language of Object.values(Languages)) {
        queues.push(`${complexity}_${category}_${language}`);
      }
    }
  }
};

const setUpQueue = async (queueName: string) => {
  const consumerChannel = await mrConnection.createChannel();
  await consumerChannel.assertQueue(queueName);

  consumerChannel.consume(queueName, (msg) => {
    if (msg !== null) {
      matchUsers(queueName, msg.content.toString());
      consumerChannel.ack(msg);
    }
  });
};

export const connectToRabbitMq = async () => {
  try {
    initQueueNames();
    mrConnection = await amqplib.connect(RABBITMQ_ADDR);
    for (const queue of queues) {
      await setUpQueue(queue);
      pendingQueueRequests.set(queue, new Map<string, MatchRequestItem>());
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export const sendToQueue = async (
  complexity: string,
  category: string,
  language: string,
  data: MatchRequestItem
): Promise<boolean> => {
  try {
    const queueName = `${complexity}_${category}_${language}`;
    const senderChannel = await mrConnection.createChannel();
    senderChannel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const getPendingRequests = (
  queueName: string
): Map<string, MatchRequestItem> => {
  return pendingQueueRequests.get(queueName)!;
};
