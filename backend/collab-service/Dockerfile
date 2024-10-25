FROM node:20-alpine

WORKDIR /collab-service

COPY package*.json .

RUN npm ci

COPY . .

EXPOSE 3003

CMD ["npm", "run", "dev"]
