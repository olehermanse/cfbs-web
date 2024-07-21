FROM node:18-alpine AS build
ARG GITHUB_USERNAME_TOKEN
WORKDIR /build-website
ADD https://github.com/gohugoio/hugo/releases/download/v0.129.0/hugo_0.129.0_Linux-64bit.tar.gz hugo.tar.gz
RUN echo "d95283cfd906ea9238cc5d86b88448f063ce9ea8021fc936bce0b3ed7e4af49d  hugo.tar.gz" | sha256sum -c
RUN tar -zxvf hugo.tar.gz
COPY package-lock.json package.json ./
RUN npm ci
COPY . ./
RUN npm run build
RUN ./hugo -v
RUN npm run create-modules-json
RUN rm ./public/package.json
RUN rm ./public/package-lock.json
RUN find public -type f -regex '^.*\.\(svg\|css\|html\|xml\)$' -size +1k -exec gzip -k '{}' \;

FROM nginx:stable-alpine
RUN apk add --no-cache nodejs npm
RUN npm i -g forever
COPY --from=build /build-website/redirects.txt /etc/nginx/conf.d/
COPY --from=build /build-website/public /usr/share/nginx/html
COPY --from=build /build-website/proxy /usr/share/proxy
COPY ./entrypoint.sh /entrypoint.sh
COPY ./nginx.conf /etc/nginx/nginx.conf
ENTRYPOINT /entrypoint.sh
