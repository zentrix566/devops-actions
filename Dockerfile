FROM nginx:alpine

LABEL maintainer="devops-actions"
LABEL description="DevOps Actions 示例应用"

# 复制前端文件到 nginx 目录
COPY app/ /usr/share/nginx/html/

# 配置 nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
