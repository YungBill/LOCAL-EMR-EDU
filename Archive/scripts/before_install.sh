#!/bin/bash
cd /home/ec2-user
rm -rf *
fuser -k 443/tcp  > /dev/null
systemctl restart awslogsd