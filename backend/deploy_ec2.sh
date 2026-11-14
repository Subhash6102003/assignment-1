#!/usr/bin/env bash
# ==============================================================================
# LaunchPulse GTM Studio — AWS EC2 Automated Deployment Script
# Operating System: Ubuntu 22.04 / 24.04 LTS
# ==============================================================================

set -e

echo ">>> [1/5] Updating system packages and installing prerequisites..."
sudo apt-get update -y
sudo apt-get install -y python3 python3-venv python3-pip git nginx certbot python3-certbot-nginx

echo ">>> [2/5] Creating Python virtual environment and installing dependencies..."
cd "$(dirname "$0")"
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo ">>> [3/5] Initializing and seeding LaunchPulse database..."
python seed.py

echo ">>> [4/5] Installing and configuring Systemd service..."
sudo cp launchpulse.service /etc/systemd/system/launchpulse.service
sudo systemctl daemon-reload
sudo systemctl enable launchpulse
sudo systemctl restart launchpulse

echo ">>> [5/5] Configuring Nginx reverse proxy..."
sudo tee /etc/nginx/sites-available/launchpulse > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/launchpulse /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "=============================================================================="
echo "✅ LaunchPulse Backend successfully deployed on AWS EC2!"
echo "Status check: sudo systemctl status launchpulse"
echo "API Endpoint: http://$(curl -s ifconfig.me)/api/products"
echo "To attach free HTTPS certificate: sudo certbot --nginx -d your-domain.com"
echo "=============================================================================="
