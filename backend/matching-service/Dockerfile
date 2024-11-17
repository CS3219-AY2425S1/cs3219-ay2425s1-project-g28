FROM node:20-alpine AS base

WORKDIR /matching-service

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3002

# DEV

FROM base AS dev

CMD ["npm", "run", "dev"]

# PROD

FROM base AS prod

RUN npm run build

CMD ["npm", "start"]
