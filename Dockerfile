# Original credit: https://github.com/jpetazzo/dockvpn

# Smallest base image
FROM node:10.23.1-alpine3.9

# Testing: pamtester
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing/" >> /etc/apk/repositories && \
    apk add --update openvpn iptables bash easy-rsa openvpn-auth-pam google-authenticator pamtester libqrencode && \
    ln -s /usr/share/easy-rsa/easyrsa /usr/local/bin && \
    rm -rf /tmp/* /var/tmp/* /var/cache/apk/* /var/cache/distfiles/*

# Needed by scripts
ENV OPENVPN=/etc/openvpn
ENV EASYRSA=/usr/share/easy-rsa \
    EASYRSA_CRL_DAYS=3650 \
    EASYRSA_PKI=$OPENVPN/pki

VOLUME ["/etc/openvpn"]

# Internally uses port 1194/udp, remap using `docker run -p 443:1194/tcp`
EXPOSE 1194/udp

ADD ./bin /usr/local/bin
RUN chmod a+x /usr/local/bin/*

# Ngrok tunneling
RUN apk --no-cache add curl
RUN apk --no-cache add jq
COPY start.sh /
COPY mailing/* /mailing/
RUN yarn --cwd /mailing
RUN npm install typescript ts-node -g

# Add support for OTP authentication using a PAM module
ADD ./otp/openvpn /etc/pam.d/

#START
RUN awk '{ sub("\r$", ""); print }' /start.sh > /start_unix.sh
RUN chmod +x /start_unix.sh 
CMD ["./start_unix.sh"]
