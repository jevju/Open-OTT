#!/bin/bash

# Downloads and builds nginx source to /usr/local/nginx
install_nginx(){

    sudo -s <<AsRoot

    mkdir -p /usr/local/src/
    cd /usr/local/src

    # Download nginx
    curl -OL https://nginx.org/download/nginx-1.19.2.tar.gz
    tar -xvzf nginx-1.19.2.tar.gz && rm nginx-1.19.2.tar.gz

    # Download PCR library
    curl -OL https://ftp.pcre.org/pub/pcre/pcre-8.44.tar.gz
    tar -xvzf pcre-8.44.tar.gz && rm pcre-8.44.tar.gz

    cd nginx-1.19.2/
    ./configure --conf-path=/usr/local/nginx/nginx.conf --sbin-path=/usr/local/nginx/nginx --with-pcre=/usr/local/src/pcre-8.44

    make && make install

    cat <<EOF > /usr/local/nginx/nginx.conf
    worker_processes  1;
    events {
        worker_connections  1024;
    }
    http {
        include       mime.types;
        default_type  application/octet-stream;
        sendfile        on;
        keepalive_timeout  65;
        server {
            listen       80;
            server_name  localhost;
            location / {
                proxy_pass http://127.0.0.1:8000;
            }
            error_page   500 502 503 504  /50x.html;
            location = /50x.html {
                root   html;
            }
        }
        client_max_body_size 0;
    }

EOF

    rm -rf /usr/local/src/pcre-8.44/
    rm -rf /usr/local/src/nginx-1.19.2/
AsRoot
}


create_plist(){

  sudo -s <<AsRoot

  mkdir -p /Library/LaunchDaemons/
  cat <<EOF > /Library/LaunchDaemons/nginx.plist
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
      <dict>
        <key>Label</key>
        <string>nginx</string>
        <key>RunAtLoad</key>
        <true/>
        <key>KeepAlive</key>
        <true/>
        <key>ProgramArguments</key>
        <array>
            <string>/usr/local/nginx/nginx</string>
            <string>-g</string>
            <string>daemon off;</string>
        </array>
        <key>WorkingDirectory</key>
        <string>/usr/local</string>
      </dict>
    </plist>
EOF

  launchctl load -w /Library/LaunchDaemons/nginx.plist


AsRoot
}


uninstall(){

  sudo -s <<AsRoot
  launchctl unload /Library/LaunchDaemons/nginx.plist
  rm /Library/LaunchDaemons/nginx.plist
  rm -rf /usr/local/nginx/
AsRoot
}

install_nginx
create_plist
# uninstall
