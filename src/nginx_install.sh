#!/bin/sh

# Downloads and builds nginx source to /usr/local/nginx
install_nginx(){

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

}


create_plist(){

  mkdir -p /Library/LaunchDaemons/
  cat <<- EOF > /Library/LaunchDaemons/nginx.plist
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

}

sudo -s <<- EOF

install_nginx

create_plist

EOF
