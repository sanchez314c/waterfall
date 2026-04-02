# Waterfall

Edgeless masonry photo gallery with auto-scroll. Point it at a folder of images and it serves a dark, full-bleed waterfall layout. Built for sharing portfolio work via a single link.

## What it does

- Serves images from any local directory as a masonry waterfall grid
- Auto-generates 800px webp thumbnails for fast loading
- Auto-scrolls on desktop, natural touch scrolling on mobile
- Click/tap any photo for full-res lightbox
- Randomized order on each page load
- Responsive: 4 columns -> 3 -> 2 -> 1 based on screen width

## Setup

```bash
npm install
```

Edit `IMAGES_DIR` in `server.js` and `generate-thumbs.js` to point at your image folder.

Generate thumbnails (one-time, skips existing):
```bash
npm run thumbs
```

Run:
```bash
npm start
```

Server starts on port 7749. Hit `http://localhost:7749`.

## Controls

- **Scroll** button toggles auto-scroll on/off
- **Speed** button cycles through 0.5x, 1x, 2x, 3x
- Click any image for full-res lightbox (Escape or click to close)
- On mobile: swipe down to dismiss lightbox
- Auto-scroll pauses when you scroll manually, resumes after 3s

## Systemd

Copy `waterfall.service` to `/etc/systemd/system/`, update paths if needed:

```bash
sudo cp waterfall.service /etc/systemd/system/
sudo systemctl enable waterfall
sudo systemctl start waterfall
```

## Cloudflare Tunnel

Add an ingress rule to your cloudflared config:

```yaml
- hostname: your.domain.com
  service: http://localhost:7749
```

Then route DNS: `cloudflared tunnel route dns <tunnel-name> your.domain.com`

## Stack

- Node.js + Express
- Sharp (thumbnail generation)
- Vanilla HTML/CSS/JS (no build step, no framework)
