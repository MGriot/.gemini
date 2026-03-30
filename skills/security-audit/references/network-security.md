# Network & Port Security Reference

## Port Exposure Threat Model

Before anything else, ask: **"Who should be able to reach this port?"**

| Port | Service | Should be public? | Notes |
|------|---------|-------------------|-------|
| 80, 443 | HTTP/HTTPS | ✅ Yes | Only these for web apps |
| 22 | SSH | ⚠️ Restricted only | Allowlist IPs, use keys |
| 5432 | PostgreSQL | ❌ Never | Private network only |
| 3306 | MySQL/MariaDB | ❌ Never | Private network only |
| 27017 | MongoDB | ❌ Never | Exposed MongoDB = data breach |
| 6379 | Redis | ❌ Never | No auth by default in old versions |
| 9200 | Elasticsearch | ❌ Never | Many breaches from open ES |
| 8501 | Streamlit | ❌ Never directly | Behind reverse proxy only |
| 8000/8080 | FastAPI/uvicorn dev | ❌ Never directly | Behind nginx/Caddy in prod |
| 5678 | Python debugger (debugpy) | ❌ Never | Remove from production entirely |
| 4444 | Various debug tools | ❌ Never | |
| 5555 | Flower (Celery) | ⚠️ Auth required | Behind auth middleware |
| 3000 | Grafana / Node dev | ⚠️ Auth required | Never open without auth |
| 9090 | Prometheus | ⚠️ Internal only | Can expose internal metrics |
| 8888 | Jupyter | ❌ Never without auth | Jupyter = RCE if open |

---

## Linux Firewall (ufw)

```bash
# Check current rules
sudo ufw status verbose

# Default deny all incoming, allow outgoing
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow only what's needed
sudo ufw allow 443/tcp    # HTTPS
sudo ufw allow 80/tcp     # HTTP (for redirect to HTTPS)
sudo ufw allow 22/tcp     # SSH — consider restricting to IP

# Restrict SSH to specific IP
sudo ufw delete allow 22/tcp
sudo ufw allow from 203.0.113.0/24 to any port 22

# Allow internal DB access from app server only
sudo ufw allow from 10.0.0.5 to any port 5432

# Enable and check
sudo ufw enable
sudo ufw status numbered

# View what's actually listening
ss -tlnp       # Linux
netstat -tlnp  # older systems
```

---

## iptables (more granular)

```bash
# Flush and set default drop
iptables -F
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT

# Allow HTTPS
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Allow SSH from specific IP
iptables -A INPUT -p tcp --dport 22 -s 203.0.113.0/24 -j ACCEPT

# PostgreSQL from app server only
iptables -A INPUT -p tcp --dport 5432 -s 10.0.0.5 -j ACCEPT

# Save rules
iptables-save > /etc/iptables/rules.v4
```

---

## nginx Reverse Proxy (Security-Focused Config)

```nginx
# /etc/nginx/sites-available/myapp

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    # TLS config
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;          # drop TLS 1.0/1.1
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-ancestors 'none';" always;

    # Hide nginx version
    server_tokens off;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=1r/s;

    # Proxy to FastAPI
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;

        # Buffer settings
        proxy_buffering on;
        client_max_body_size 10m;
    }

    location /api/auth/ {
        limit_req zone=auth burst=5;    # strict rate limit on auth
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Block hidden files
    location ~ /\. {
        deny all;
    }

    # Block common attack paths
    location ~* \.(git|env|config|bak|sql|log)$ {
        deny all;
    }
}
```

---

## Caddy (simpler, automatic HTTPS)

```caddy
# Caddyfile — automatic TLS from Let's Encrypt
example.com {
    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Frame-Options DENY
        X-Content-Type-Options nosniff
        Referrer-Policy strict-origin-when-cross-origin
        -Server
    }

    # Rate limiting (with caddy-ratelimit plugin)
    rate_limit {
        zone api {
            key {remote_host}
            events 100
            window 1m
        }
    }

    # Reverse proxy
    reverse_proxy /api/* localhost:8000

    # Static React build
    root * /var/www/app
    file_server

    # Block dangerous paths
    @blocked path_regexp \.(env|git|sql|log|bak)$
    respond @blocked 403
}
```

---

## SSH Hardening

```bash
# /etc/ssh/sshd_config
PermitRootLogin no                  # never log in as root
PasswordAuthentication no          # keys only
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
MaxAuthTries 3
LoginGraceTime 20
AllowUsers deploy ubuntu            # whitelist specific users
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
AllowTcpForwarding no

# Restart SSH after changes
sudo systemctl restart sshd

# Fail2ban for brute force protection
sudo apt install fail2ban
# /etc/fail2ban/jail.local:
# [sshd]
# enabled = true
# maxretry = 3
# bantime = 3600
```

---

## Rate Limiting at Network Level

```bash
# iptables: limit SSH connection attempts
iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set
iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 -j DROP

# iptables: limit HTTP to prevent basic DoS
iptables -A INPUT -p tcp --dport 80 -m limit --limit 100/minute --limit-burst 200 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j DROP
```

---

## Port Scanning — Check Your Own Exposure

```bash
# Scan from outside your server (run from a different machine)
nmap -sV -p- --open your-server-ip

# Quick scan of common ports
nmap -p 22,80,443,3306,5432,6379,8000,8080,8501,27017 your-server-ip

# Check what's listening locally
ss -tlnp
lsof -i -n -P | grep LISTEN

# Check if a specific port is accessible from outside
nc -zv your-server-ip 5432    # should fail (connection refused or timeout)
```

---

## VPN / Private Network for Internal Services

For production:
```
Internet
    │
    ▼
[Load Balancer / CDN]  ← Only 443 open
    │
    ▼
[nginx / Caddy]       ← Private network
    │
    ├─► [FastAPI :8000]
    ├─► [Streamlit :8501]
    └─► [Admin tools]
            │
            ▼
    [PostgreSQL :5432]   ← Not reachable from internet
    [Redis :6379]        ← Not reachable from internet
```

All internal services communicate on private IP (10.x.x.x / 172.16.x.x / 192.168.x.x). Only the reverse proxy has a public IP with ports 80/443 open.

---

## Network Security Checklist

- [ ] Only ports 80 and 443 open to public internet
- [ ] SSH restricted to IP allowlist or VPN only
- [ ] Database ports (5432, 3306, 27017, 6379) unreachable from internet
- [ ] Admin UIs (pgAdmin, Grafana, Flower, Jupyter) behind auth + IP restriction
- [ ] Debug ports (5678, 4444, 8888) not running in production at all
- [ ] nginx/Caddy in front of all app servers
- [ ] TLS 1.2+ only, TLS 1.0/1.1 disabled
- [ ] HSTS header with preload
- [ ] nginx `server_tokens off`
- [ ] Rate limiting at reverse proxy layer
- [ ] `server.address = 127.0.0.1` for Streamlit
- [ ] ufw/iptables default-deny policy
- [ ] Fail2ban installed for SSH and HTTP
- [ ] Regular `nmap` scan from outside to verify exposure
