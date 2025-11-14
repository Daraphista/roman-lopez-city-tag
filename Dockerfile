# Dockerfile
FROM node:20-slim

# Minimal packages only if needed (you probably don't!)
# RUN apt-get update && apt-get install -y \
#   wget \
#   && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 8080
CMD ["node", "server.js"]
