# Use an official Node runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app


# Copy package.json and package-lock.json
COPY package*.json ./

# Copy the rest of the application code
COPY . .

# Install pnpm
RUN npm install -g pnpm

RUN pnpm install

# Build the application
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 4173

# Start the preview server
CMD ["pnpm", "run", "preview"]
