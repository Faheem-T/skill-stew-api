FROM node:24-alpine

WORKDIR /app
COPY package.json .
# RUN npm config set strict-ssl false
RUN npm install
COPY . .

CMD ["sh", "-c", "npm run syncDb && npm start"]
