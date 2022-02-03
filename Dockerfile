FROM node:14.9.0

#APP
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install -g node-pre-gyp
RUN npm install
COPY . .

EXPOSE 3000
CMD [ "npm", "run", "prod" ]
