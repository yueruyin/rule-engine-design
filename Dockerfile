FROM 192.168.0.114:37071/docker.io/nginx:stable-alpine
LABEL maintainer="zenith-yfzx-jsyfb"
# 新建目录
RUN mkdir -p /data/work/
WORKDIR /data/work/
# 导入打包好的文件
COPY app.tar.gz /data/work/
# 使 nginx 日志输出在标准输出
RUN tar zxvf app.tar.gz \
    && echo "=================" \
    && mv node/work/* ./ \
    && rm -rf /etc/nginx/conf.d \
    && mv build/nginx/conf.d /etc/nginx/ \
    && chown root:root -R /etc/nginx/conf.d/ \
    && ls -a /data/work \
    && ln -snf /dev/stdout /var/log/nginx/access.log \
    && ln -snf /dev/stderr /var/log/nginx/error.log
EXPOSE 8080
CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
 
