FROM node:12
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm test
COPY . .
ENV PORT=8080
EXPOSE 8080
CMD ["node","index"]