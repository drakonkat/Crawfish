FROM node:12.22.9

#Configuration
RUN apt-get -y update
RUN apt-get -y install git
RUN apt install -y build-essential libssl-dev wget tar
RUN wget https://github.com/Kitware/CMake/releases/download/v3.20.2/cmake-3.20.2.tar.gz
RUN tar -zxvf cmake-3.20.2.tar.gz
RUN cd cmake-3.20.2 && ./bootstrap && make && make install
RUN which cmake
RUN cmake --version
RUN apt install build-essential
RUN gcc --version

#Test build
WORKDIR /usr/src/
RUN git clone https://github.com/node-webrtc/node-webrtc.git
COPY .env /usr/src/node-webrtc/
RUN cd node-webrtc && npm install --save-dev node-cmake && npm i && SKIP_DOWNLOAD=true npm run install

#APP
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install -g node-pre-gyp
RUN npm install
RUN cp /usr/src/node-webrtc/build/Release/wrtc.node node_modules/wrtc/build/Release/wrtc.node
#RUN #cd node_modules/wrtc && npm install --save-dev node-cmake && npm i && npm run install --build-from-source
COPY . .

EXPOSE 3000
CMD [ "npm", "run", "prod" ]
