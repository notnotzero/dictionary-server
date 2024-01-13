# Use an official Node runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install any necessary dependencies
RUN npm install

# Bundle the app source inside the Docker image
COPY . .

# Make port 8080 available outside this container
EXPOSE 8080

# Define the command to run the app
CMD [ "node", "server.js" ]
