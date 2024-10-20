import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Handlebars from "handlebars";

dotenv.config();

const SERVICE = process.env.SERVICE;
const USER = process.env.USER;
const PASS = process.env.PASS;

const transporter = nodemailer.createTransport({
  service: SERVICE,
  auth: { user: USER, pass: PASS },
});

export const sendMail = async (
  to: string,
  subject: string,
  username: string,
  htmlTemplate: string,
  token: string
) => {
  const template = Handlebars.compile(htmlTemplate);
  const replacement = { username, token };
  const html = template(replacement);
  const options = {
    from: USER,
    to,
    subject,
    html,
  };
  return transporter.sendMail(options);
};
