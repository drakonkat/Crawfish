FROM node:16.8.0
WORKDIR /usr/src
RUN git clone https://gitlab.com/t5257/webtorrent-web-gui-standalone.git
WORKDIR /usr/src/webtorrent-web-gui-standalone/
RUN rm ./package-lock.json
RUN npm install
RUN npm run build-local

#APP
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install -g node-pre-gyp
RUN npm install
COPY . .
RUN cp -R ../webtorrent-web-gui-standalone/build ./public/

EXPOSE 3000
CMD [ "npm", "run", "prod" ]
