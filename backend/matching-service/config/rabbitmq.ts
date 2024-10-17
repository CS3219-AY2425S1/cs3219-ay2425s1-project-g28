import amqplib, { Connection } from "amqplib";
import dotenv from "dotenv";
import { matchUsers } from "../src/utils/mq_utils";
import { MatchRequestItem } from "../src/handlers/matchHandler";

dotenv.config();

let mrConnection: Connection;
const queue = "match_requests";

export const connectRabbitMq = async () => {
  try {
    mrConnection = await amqplib.connect(`${process.env.RABBITMQ_ADDR}`);
    const consumerChannel = await mrConnection.createChannel();
    await consumerChannel.assertQueue(queue);

    consumerChannel.consume(queue, (msg) => {
      if (msg !== null) {
        matchUsers(msg.content.toString());
        consumerChannel.ack(msg);
      }
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export const sendRabbitMq = async (
  data: MatchRequestItem
): Promise<boolean> => {
  try {
    const senderChannel = await mrConnection.createChannel();
    senderChannel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
