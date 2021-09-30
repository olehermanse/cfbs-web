FROM node:alpine AS build
ARG GITHUB_USERNAME_TOKEN
WORKDIR /cfbs-web
ADD https://github.com/gohugoio/hugo/releases/download/v0.74.3/hugo_0.74.3_Linux-64bit.tar.gz hugo.tar.gz
RUN tar -zxvf hugo.tar.gz
COPY ./ /cfbs-web
RUN npm i
RUN npm i -g grunt-cli
RUN grunt modules-update
RUN grunt lunr-index
RUN grunt copy-lunr-src
RUN npx -p less lessc --compress /cfbs-web/themes/cfbs-theme/styles/cfbs.less /cfbs-web/themes/cfbs-theme/static/css/style.min.css
RUN ./hugo -v
RUN find public -type f -regex '^.*\.\(svg\|css\|html\|xml\)$' -size +1k -exec gzip -k '{}' \;

FROM nginx:stable-alpine
COPY --from=build /cfbs-web/public /usr/share/nginx/html
COPY ./entrypoint.sh /entrypoint.sh
COPY ./nginx.conf /etc/nginx/nginx.conf
ENTRYPOINT /entrypoint.sh
