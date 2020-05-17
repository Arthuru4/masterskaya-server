FROM node:latest
WORKDIR /server
COPY ./package*.json ./
RUN npm install
RUN npm install nodemon
COPY . .
EXPOSE 3002
CMD ["npx", "nodemon", "server.js"]