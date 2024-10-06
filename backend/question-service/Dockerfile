FROM node:20-alpine

WORKDIR /question-service

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
