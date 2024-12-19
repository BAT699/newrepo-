FROM node:18

WORKDIR /usr/src/app

COPY . .

EXPOSE 5413

CMD ["node", "server.js"]
