
# Build stage
FROM node:20-alpine as build-stage

WORKDIR /app

# Package json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the source files
COPY . .

# Set environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Populate environment variables into .env file
RUN echo "VITE_API_URL=$VITE_API_URL" > .env

# Build the app
RUN npm run build


# Stage 2. Nginx
FROM nginx:1.16 as production-stage

# Set user to root to perform permission changes
USER root

# Create required directories and set permissions
RUN mkdir -p /var/cache/nginx/client_temp \
    && chmod -R 777 /var/cache/nginx \
    && chown -R nginx:nginx /var/cache/nginx

# Copy the build output from stage 1
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy the nginx configuration file
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Adjust Nginx to not use the default pid location which could cause permission errors
RUN echo "pid /tmp/nginx.pid;" >> /etc/nginx/nginx.conf

# Switch back to a non-root user for security
USER 1001

# Expose port
EXPOSE 8080

# Start the Nginx
CMD ["nginx", "-g", "daemon off;"]
