# CS3219 Project (PeerPrep) - AY2425S1 Group 28

## Deployment

We deployed PeerPrep on AWS ECS. It is accessible [here](http://peerprep-frontend-alb-1935920115.ap-southeast-1.elb.amazonaws.com/).

## Setting up

We will be using Docker to set up PeerPrep. Install Docker [here](https://docs.docker.com/get-started/get-docker).

Follow the instructions in [here](./backend/README.md) first before proceeding.

1. Build all the services (without using cache).

```
docker-compose build --no-cache
```

2. Run all the services (in detached mode).

```
docker-compose up -d
```

To stop all the services, use the following command:

```
docker-compose down
```

## Running in Production Mode

1. Build all the services (without using cache).

```
docker-compose -f docker-compose-prod.yml build --no-cache
```

2. Run all the services (in detached mode).

```
docker-compose -f docker-compose-prod.yml up -d
```

To stop all the services, use the following command:

```
docker-compose -f docker-compose-prod.yml down
```

## Useful links

- User Service: http://localhost:3001

- Question Service: http://localhost:3000

- Matching Service: http://localhost:3002

- Collab Service: http://localhost:3003

- Code Execution Service: http://localhost:3004

- Communication Service: http://localhost:3005

- Question History Service: http://localhost:3006

- Frontend: http://localhost:5173
