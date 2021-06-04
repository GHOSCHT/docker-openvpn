#!/bin/bash
./ngrok authtoken $AUTHTOKEN
./ngrok tcp 1194 > /dev/null &
sleep 3
export NGROK_URL="$(curl http://localhost:4040/api/tunnels | jq ".tunnels[0].public_url")" 
echo --------------------
echo $NGROK_URL
cd notifications && ts-node sendMail.ts
echo --------------------
ovpn_run
