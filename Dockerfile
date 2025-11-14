FROM node:20-slim

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN npx playwright install --with-deps

EXPOSE 8080
CMD ["node", "server.js"]
