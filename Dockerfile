FROM node:8 AS build
ADD ./ /cpm.directory
WORKDIR /cpm.directory
RUN rm -rf web/dist
RUN rm -rf backend/web
RUN sh -c "cd frontend && npm install && npm run build"

FROM nginx:stable-alpine
COPY --from=build /cpm.directory/frontend/dist /usr/share/nginx/html
