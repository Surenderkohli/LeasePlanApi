FROM node:alpine
RUN npm i -g pnpm
WORKDIR /app
COPY . ./
RUN pnpm install
ENTRYPOINT pnpm start
##