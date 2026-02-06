# Build stage
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application (Nginx 프록시 사용하므로 환경 변수 불필요)
RUN npm run build

# Runtime stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Copy built files from build stage
COPY --from=build /app/dist .

# Copy nginx config template
COPY nginx.conf /etc/nginx/templates/nginx.conf.template

# Set default PORT
ENV PORT=80

# Create startup script
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo '# /etc/resolv.conf에서 DNS resolver 읽기' >> /docker-entrypoint.sh && \
    echo 'export NAMESERVER=$(cat /etc/resolv.conf | grep nameserver | head -1 | awk "{print \$2}")' >> /docker-entrypoint.sh && \
    echo 'echo "Using DNS resolver: $NAMESERVER"' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# PORT와 NAMESERVER를 nginx.conf에 주입' >> /docker-entrypoint.sh && \
    echo 'envsubst "\$PORT \$NAMESERVER" < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'cat /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'nginx -t' >> /docker-entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE $PORT

# Start nginx
CMD ["/docker-entrypoint.sh"]
