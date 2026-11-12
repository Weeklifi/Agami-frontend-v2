#!/usr/bin/env bash
export PATH="/home/riad/.nvm/versions/node/v24.18.0/bin:$PATH"
cd /home/riad/agami-frontend-v2
exec npm run dev -- --port 5174
