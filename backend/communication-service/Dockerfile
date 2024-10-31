FROM node:20-alpine

WORKDIR /communication-service

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3005

CMD ["npm", "run", "dev"]