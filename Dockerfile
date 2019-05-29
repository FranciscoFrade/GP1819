FROM node:carbon

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app

# Install Dependencies
RUN npm install

EXPOSE 8080
#CMD node server.js
CMD node app.js
