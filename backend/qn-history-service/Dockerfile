FROM node:20-alpine

WORKDIR /qn-history-service

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3006

CMD ["npm", "run", "dev"]
