# Use an official Node.js runtime as the base image
FROM node:21.4.0

# Set the working directory in the Docker container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json into the Docker container
COPY package*.json ./

# Install the application's dependencies inside the Docker container
RUN npm install

# Copy the rest of the application's code into the Docker container
COPY . .

# Expose port 3000 for the application
EXPOSE 3000

# Define the command that will be executed when the Docker container is run
CMD [ "node", "index.js" ]
