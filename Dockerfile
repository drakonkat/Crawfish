FROM node:14.9.0

#APP
WORKDIR /usr/src/app
COPY package*.json ./
RUN git clone https://gitlab.com/t5257/webtorrent-web-gui-standalone.git
RUN cd webtorrent-web-gui-standalone/ && npm i && npm run build-local && RUN cp -R build ../public/
RUN cd ..
RUN rm -rf webtorrent-web-gui-standalone/
RUN npm install -g node-pre-gyp
RUN npm install
COPY . .

EXPOSE 3000
CMD [ "npm", "run", "prod" ]
