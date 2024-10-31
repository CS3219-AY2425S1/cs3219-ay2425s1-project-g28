FROM node:20-alpine

WORKDIR /qn-history-service

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3005

CMD ["npm", "run", "dev"]
