FROM node:16
#APP
WORKDIR /usr/src/app
COPY package*.json ./
COPY ./ ./
RUN npm i --prefix /website/crawfish-official
RUN npm run --prefix /website/crawfish-official build
RUN npm install -g @mapbox/node-pre-gyp
RUN npm install
COPY . .
RUN cp -R ../webtorrent-web-gui-standalone/build ./public/

EXPOSE 3000
CMD [ "npm", "run", "prod" ]
