FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY . .

RUN npm install -g pnpm

# Optional: use a faster registry
RUN pnpm config set registry https://registry.npmmirror.com

# Retry installation if it fails
RUN for i in 1 2 3; do pnpm install && break || sleep 10; done

RUN pnpm run build

EXPOSE 4173
CMD ["pnpm", "run", "preview"]
