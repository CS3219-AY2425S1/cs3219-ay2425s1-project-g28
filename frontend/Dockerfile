FROM node:20-alpine as base

WORKDIR /frontend 

COPY package*.json ./

RUN npm ci

COPY . .

# DEV

FROM base AS dev

EXPOSE 5173

CMD ["npm", "run", "dev"]

# PROD

FROM base AS prod

RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview"]
