FROM node:alpine AS build
ARG GITHUB_USERNAME_TOKEN
WORKDIR /cfbs-web
ADD https://github.com/gohugoio/hugo/releases/download/v0.104.3/hugo_0.104.3_Linux-64bit.tar.gz hugo.tar.gz
RUN echo "da45809872c2c3a318c277adcacd80d00f4e0cd4527640f67055beac3b642333  hugo.tar.gz" | sha256sum -c
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
COPY --from=build /cfbs-web/redirects.txt /etc/nginx/conf.d/
COPY --from=build /cfbs-web/public /usr/share/nginx/html
COPY --from=build /cfbs-web/proxy /usr/share/proxy
COPY ./entrypoint.sh /entrypoint.sh
COPY ./nginx.conf /etc/nginx/nginx.conf
ENTRYPOINT /entrypoint.sh
