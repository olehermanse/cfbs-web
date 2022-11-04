FROM node:alpine AS build
ARG GITHUB_USERNAME_TOKEN
WORKDIR /cfbs-web
ADD https://github.com/gohugoio/hugo/releases/download/v0.100.0/hugo_0.100.0_Linux-64bit.tar.gz hugo.tar.gz
RUN echo "1c0b2979b9ec05ed0dfee4325b205cfb7fb516cf606d7e09f274e0d291cfe7cc  hugo.tar.gz" | sha256sum -c
RUN tar -zxvf hugo.tar.gz
COPY ./ /cfbs-web
RUN npm i
RUN npm i -g grunt-cli
RUN grunt build
RUN ./hugo -v
RUN grunt create-modules-json
RUN find public -type f -regex '^.*\.\(svg\|css\|html\|xml\)$' -size +1k -exec gzip -k '{}' \;

FROM nginx:stable-alpine
RUN apk add --no-cache nodejs npm
RUN npm i -g forever
COPY --from=build /website/redirects.txt /etc/nginx/conf.d/
COPY --from=build /cfbs-web/public /usr/share/nginx/html
COPY --from=build /cfbs-web/proxy /usr/share/proxy
COPY ./entrypoint.sh /entrypoint.sh
COPY ./nginx.conf /etc/nginx/nginx.conf
ENTRYPOINT /entrypoint.sh
