# Use an official Node runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app


# Copy package.json and package-lock.json
COPY package*.json ./

# Copy the rest of the application code
COPY . .

# Install pnpm
RUN npm install 



# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 4173

# Start the preview server
CMD ["npm", "run", "preview"]
