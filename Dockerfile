FROM node:8 AS cfbs-web-build
ADD ./ /cfbs-web
WORKDIR /cfbs-web
RUN sh -c "cd frontend && npm install && npm run build"

FROM nginx:stable-alpine
RUN rm -f /usr/share/nginx/html/index.html
COPY --from=cfbs-web-build /cfbs-web/frontend/dist/* /usr/share/nginx/html/
