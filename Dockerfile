FROM node:18-alpine

WORKDIR /app
COPY . .

RUN npm i --legacy-peer-deps
ENV ENVIRONMENT="homolog"
ENV VERSION=""

RUN npm install -g sequelize-cli

RUN apk --no-cache add curl
HEALTHCHECK CMD curl --fail http://localhost:3000/healthcheck || exit 1

ENTRYPOINT NODE_ENV=${ENVIRONMENT} VERSION=${VERSION} npm run start:migrate