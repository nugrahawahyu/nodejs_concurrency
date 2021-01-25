FROM node:14

WORKDIR /app

COPY . /app

RUN yarn

CMD node index.js
