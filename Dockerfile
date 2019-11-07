FROM node:8 AS build
ADD ./ /cpm.directory
WORKDIR /cpm.directory
RUN sh -c "cd frontend && npm install && npm run build"

FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html/index.html
COPY --from=build /cpm.directory/frontend/dist /usr/share/nginx/html
