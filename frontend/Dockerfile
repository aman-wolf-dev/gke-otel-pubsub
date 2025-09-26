FROM node:18 AS build
WORKDIR /app

# Install all deps (including devDependencies)
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2 - Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]