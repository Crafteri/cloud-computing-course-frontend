# Build stage
FROM node:20-alpine as build-stage

WORKDIR /app

# Copy package.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage

# Set user to root to perform permission changes
USER root

# Create required directories and set permissions
RUN mkdir -p /var/cache/client_temp \
    && chmod -R 777 /var/cache/nginx \
    && chown -R 777 nginx:nginx /var/cache/nginx

# Copy the build files from the build stage to the production stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy the nginx configuration file
COPY ./nginx.conf /etc/nginx/nginx.conf

# Set the pid file location to avoid permission issues
RUN echo "pid /tmp/nginx.pid;" >> /etc/nginx/nginx.conf

# Switch back to the nginx user
USER 1001

# Expose port 8080
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]