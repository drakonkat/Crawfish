FROM node:16
#APP
WORKDIR /app
COPY ./ ./
RUN ls website/crawfish-official
RUN npm i --prefix website/crawfish-official --legacy-peer-deps
RUN npm run build --prefix website/crawfish-official
RUN npm install -g @mapbox/node-pre-gyp
RUN npm install

EXPOSE 3000
CMD [ "npm", "run", "prod" ]
