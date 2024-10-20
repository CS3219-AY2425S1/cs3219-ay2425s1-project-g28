FROM node:20-alpine

WORKDIR /matching-service

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3002

CMD ["npm", "run", "dev"]
