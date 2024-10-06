# CS3219 Project (PeerPrep) - AY2425S1 Group 28

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

## Useful links

- User Service: http://localhost:3001
- Question Service: http://localhost:3000
- Frontend: http://localhost:5173
