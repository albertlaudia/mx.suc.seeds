# v6.0 — English, complete platform surface, security-hardened nginx
FROM nginx:1.27-alpine
COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK CMD wget --spider --quiet http://127.0.0.1/healthz || exit 1
