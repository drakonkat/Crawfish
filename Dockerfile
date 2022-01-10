FROM node:latest

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install node-pre-gyp -g
RUN npm install
COPY . .

EXPOSE 3000
CMD [ "node", "bin\www" ]