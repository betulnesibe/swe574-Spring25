#!/bin/bash

# Generate self-signed certificates for development
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout frontend.key \
  -out frontend.crt \
  -subj "/C=TR/ST=IST/L=IST/O=DEV/OU=DEV/CN=DEV/emailAddress=DEV"

# Generate keystore.p12 for backend
keytool -genkeypair -alias tomcat \
  -keyalg RSA -keysize 2048 \
  -keystore keystore.p12 \
  -storetype PKCS12 \
  -validity 365 \
  -storepass ${SSL_KEY:-changeit} \
  -dname "CN=DEV, OU=DEV, O=DEV, L=IST, ST=IST, C=TR" 