FROM node:20-alpine AS base

WORKDIR /communication-service

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3005

# DEV

FROM base AS dev

CMD ["npm", "run", "dev"]

# PROD

FROM base AS prod

RUN npm run build

CMD ["npm", "start"]