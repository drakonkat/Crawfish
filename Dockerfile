FROM node:16
WORKDIR /usr/src
WORKDIR /usr/src/app/website/crawfish-official/
RUN npm install
RUN npm run build

#APP
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install -g @mapbox/node-pre-gyp
RUN npm install
COPY . .
RUN cp -R ../webtorrent-web-gui-standalone/build ./public/

EXPOSE 3000
CMD [ "npm", "run", "prod" ]
