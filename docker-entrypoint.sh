#!/bin/sh
# ============================================
# 阅创集 (YueChuangJi) Nginx 容器启动脚本
# 根据环境变量动态生成 Nginx 配置
# ============================================

set -e

# 默认值
SERVER_NAME="${SERVER_NAME:-localhost}"
ENABLE_SSL="${ENABLE_SSL:-false}"

echo "============================================"
echo "  阅创集 Nginx 容器启动"
echo "  Server Name: ${SERVER_NAME}"
echo "  SSL: ${ENABLE_SSL}"
echo "============================================"

if [ "${ENABLE_SSL}" = "true" ]; then
    echo ">>> 使用 HTTPS/SSL 配置"

    # 检查 SSL 证书是否存在
    if [ -f /etc/nginx/ssl/fullchain.pem ] && [ -f /etc/nginx/ssl/privkey.pem ]; then
        echo ">>> SSL 证书已找到"

        # 使用 SSL 模板生成配置
        export SERVER_NAME
        envsubst '${SERVER_NAME}' < /etc/nginx/templates/default-ssl.conf.template > /etc/nginx/conf.d/default.conf

        echo ">>> HTTPS 配置已生成（80->443 重定向 + SSL）"
    else
        echo "!!! 警告：ENABLE_SSL=true 但未找到 SSL 证书"
        echo "!!! 请将 fullchain.pem 和 privkey.pem 放入 docker/nginx/ssl/ 目录"
        echo "!!! 降级为 HTTP 模式"

        export SERVER_NAME
        envsubst '${SERVER_NAME}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
    fi
else
    echo ">>> 使用 HTTP 配置（无 SSL）"

    # 使用 HTTP 模板生成配置
    export SERVER_NAME
    envsubst '${SERVER_NAME}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
fi

echo ">>> Nginx 配置完成，启动服务..."

# 启动 Nginx
exec "$@"
