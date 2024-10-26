FROM node:20-alpine

WORKDIR /code-execution-service

COPY package*.json .

RUN npm ci

COPY . .

EXPOSE 3003

CMD ["npm", "run", "dev"]
