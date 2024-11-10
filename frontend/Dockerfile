FROM node:20-alpine as base

WORKDIR /frontend 

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 5173

# DEV

FROM base AS dev

CMD ["npm", "run", "dev"]

# PROD

FROM base AS prod

RUN npm run build

CMD ["npm", "run", "preview"]
