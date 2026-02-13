# Valentine’s Micro-Site

A single-page Valentine experience with a time lock, poetic flow, interactive moments, and a D20-driven reasons module.

## Run

1. Open `index.html` in a browser.
2. If your browser blocks audio, click “Tap to enable sound.”
3. The site stays locked until the configured time in `script.js`.

## Configure Unlock Time

Edit `script.js` and change the constant:

```
const UNLOCK_AT_ISO = "2026-02-14T00:00:00+05:30";
```

## Notes

- Everything is static HTML/CSS/JS with no build tools.
- Audio is optional; the site works without it.
