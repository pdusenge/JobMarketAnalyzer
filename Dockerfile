FROM nginx:alpine

# Copy your entire existing app
COPY . /usr/share/nginx/html

# Create nginx config directory if it doesn't exist
RUN mkdir -p /etc/nginx/conf.d

# Copy nginx configuration
COPY nginx/web1.conf /etc/nginx/conf.d/web01.conf.template
COPY nginx/web2.conf /etc/nginx/conf.d/web02.conf.template

# Environment variable to determine which server config to use
ENV SERVER_ID=web01

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]