# Dockerfile
FROM node:12.16.1-alpine3.11

# upgrade docker packages
RUN apk --no-cache add --update bash git libgcc libstdc++ linux-headers && \
    rm -rf /var/cache/apk/*

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/

RUN npm install --build-from-source=bcrypt

# Bundle app source
COPY . /usr/src/app

ARG MONGODB_URI
ARG MAPBOX_ACCESS_TOKEN
ARG CLIENT_URL
ARG MOB_CLIENT_URL
ARG NODE_ENV

ENV MONGODB_URI=$MONGODB_URI
ENV MAPBOX_ACCESS_TOKEN=$MAPBOX_ACCESS_TOKEN
ENV CLIENT_URL=$CLIENT_URL
ENV MOB_CLIENT_URL=$MOB_CLIENT_URL
ENV NODE_ENV=$NODE_ENV

EXPOSE 5000

# defined in package.json
CMD [ "npm", "run", "start" ]
