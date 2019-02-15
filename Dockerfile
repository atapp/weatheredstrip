FROM node:11 as BUILD

WORKDIR /usr/local

COPY ./server .

RUN yarn

FROM node:alpine

COPY --from=BUILD /usr/local .

CMD yarn start
