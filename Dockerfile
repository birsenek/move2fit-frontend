FROM node:22.13.0-alpine

USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

COPY --chown=node:node . .

CMD ["yarn", "dev", "--host", "0.0.0.0"]
