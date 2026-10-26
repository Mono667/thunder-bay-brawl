# Thunder Bay Brawl

A mobile-first 2D street fighter in the style of SF2 and MK3, set on Bay Street in Thunder Bay at 2 AM. The whole game is one file, `index.html`, built with Canvas 2D and plain JavaScript. There is no build step and nothing to install to play solo.

**Play:** https://mono667.github.io/thunder-bay-brawl/ (1P vs CPU works anywhere. Online 2P needs the server described below.)

![fight](shot-fight.png)

## What's in it
- **Fighters** (placeholder shape art, ready for sprite sheets):
  - **"Lakehead" Lynx** is fast, with short reach and 1000 HP. Special: **LAKEHEAD RUSH**, a dashing knee that knocks down.
  - **The Persian** is slow and heavy, with long reach and 1100 HP. Special: **DONUT TOSS**, a pink-iced projectile.
- **Match flow:** best of 3 rounds with a 99-second timer. Banners show ROUND 1, FIGHT!, K.O., TIME and the winner.
- **Combat:**
  - Health bars with a delayed red drain.
  - Hitboxes and hurtboxes, hitstun and blockstun.
  - Chip damage on blocked hits, plus knockback and wall pushback.
  - Fighters turn to face each other automatically.
  - Jump and crouch attacks (crouching LK is a low sweep).
  - Hit sparks, screen shake and sound effects.
- **Modes:** a CPU opponent, character select, a pause menu, and online 2P with room codes.
- **Stage:** Bay Street storefronts with parallax layers: Lake Superior, the Sleeping Giant, the grain elevators, the skyline, neon signs and snow.

## Controls
| | Touch (landscape) | Keyboard |
|---|---|---|
| Move / jump / crouch | Left stick (up = jump, down = crouch) | Arrows or WASD |
| Light / heavy punch | LP / HP | J / K |
| Light / heavy kick | LK / HK | U / I |
| Block | BLK, or hold **back** | L, or hold back |
| Special | SP, or LP+HP together, or ↓ ↘ → + punch | O, or ↓ ↘ → + J/K |
| Pause | ❚❚ button | P / Esc |

Add `?boxes` to the URL to see hitboxes (red) and hurtboxes (green).

## Running it
- **Solo, quickest:** open the GitHub Pages link on a phone and turn it sideways. You can also open `index.html` straight from disk.
- **Static server on a computer:** `python3 -m http.server 8000` in this folder, then open `http://<computer-ip>:8000`. This works for solo only.
- **Online 2P:** run the Node server below. It serves the game and also relays matches between phones.

## Online 2P server on the Windows laptop
Use the always-on laptop as the server.

1. **Install Node.js LTS.** Get it from https://nodejs.org, or in PowerShell run `winget install OpenJS.NodeJS.LTS`.
2. **Get the game.** Either `git clone https://github.com/Mono667/thunder-bay-brawl.git`, or on GitHub click **Code → Download ZIP** and unzip it.
3. **Start the server.** Double-click **`start-server.bat`** in the game folder. It installs the server packages on first run, starts the server, and keeps the window open. You can also open a terminal in the `server` folder and run `npm install` once, then `node server.js`.
   - The server listens on **port 8080**. To change it, run `set PORT=9000` before `node server.js` in cmd, or `$env:PORT=9000` in PowerShell.
   - On startup the window prints `Phones open: http://192.168.x.x:8080` for each network adapter. Use the Wi-Fi one.
4. **Firewall.**
   - When Windows asks about Node.js, tick **Private networks** and click Allow.
   - Or, in an **admin** PowerShell, run:
     ```
     New-NetFirewallRule -DisplayName "Fighter 8080" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow -Profile Private
     ```
   - The Wi-Fi network must be set to **Private**: Settings → Network & internet → Wi-Fi → your network → Network profile type: Private.
5. **Find the laptop's IP.** Run `ipconfig` and use the **IPv4 Address** under "Wireless LAN adapter Wi-Fi". The server also prints it.
6. **Keep it awake.** Go to Settings → System → Power → Screen and sleep, and set "When plugged in, put my device to sleep after" to **Never**.
   - Optional: add a DHCP reservation for the laptop in your router so its IP never changes.
7. **Play from the phones.**
   - Both phones must be on the same Wi-Fi as the laptop.
   - Open `http://<laptop-ip>:8080` and tap **ONLINE 2P**. Each player picks a fighter and taps **FIGHT!**.
   - Phone 1 taps **CREATE ROOM** and gets a 4-letter code.
   - Phone 2 types the code and taps **JOIN ROOM**.
   - The creator plays P1 and their phone runs the fight.
   - The server field fills itself in when the page comes from the laptop.
8. **Internet play (optional).** Pick one:
   - Port-forward TCP 8080 on the router to the laptop's IP.
   - Or install cloudflared and run `cloudflared tunnel --url http://localhost:8080`, then share the `https://….trycloudflare.com` URL. Secure WebSockets (wss) are used automatically over https.

On the GitHub Pages copy, online play won't reach a LAN server, because browsers block an https page from opening an insecure ws:// connection. Open the game from the laptop URL, or use a cloudflared tunnel.

Check that it's up: `http://<laptop-ip>:8080/health` returns `ok`.

**Linux or macOS:** run `cd server && npm install && PORT=8080 node server.js`. The code uses only cross-platform Node.

## Swapping in real art
Every character in `CHARS` (in `src/2.js`) has `render: 'shapes'`. To switch a character to a sprite sheet, set this on it:
```js
render: 'sprite',
sprite: { src: 'art/lynx.png', fw: 96, fh: 96, ox: 48, oy: 92, scale: 1,
  anims: { idle:{row:0,n:4,fps:8}, walk:{row:1,n:6,fps:10}, crouch:{row:2,n:1}, jump:{row:3,n:2},
           punch:{row:4,n:3}, kick:{row:5,n:3}, upper:{row:6,n:3}, sweep:{row:7,n:3},
           jpunch:{row:8,n:2}, jkick:{row:9,n:2}, block:{row:10,n:1}, hit:{row:11,n:2},
           kd:{row:12,n:2}, rise:{row:13,n:2}, win:{row:14,n:4}, rush:{row:15,n:3} /* or toss */ } }
```
- **Frame layout:** each row is one animation and each frame is `fw`×`fh` pixels.
- **Anchor:** `ox`/`oy` is the point between the fighter's feet.
- **Facing:** draw facing **right**; the game mirrors it.
- **Crouch versions:** crouching moves look for a `c`-prefixed name (such as `cpunch`) first and fall back to the standing anim.
- **Fallbacks:** any missing anim uses `idle`.
- **Loading:** shapes are drawn until the image finishes loading.

Hitboxes are defined per move and are independent of the art. Use stylized likenesses only, not photos. After editing `src/`, run `node build.js` to rebuild `index.html`.

## Files
- `index.html`: the game, built from `src/1.html`, `src/2.js` (data and simulation), `src/3.js` (stage, renderers, HUD, sound) and `src/4.js` (UI, input, online, loop).
- `server/`: the Node HTTP and WebSocket server (needs the `ws` package). `start-server.bat` launches it on Windows.
- `test/test.js`: a headless Playwright test on a landscape iPhone 13 with touch.
  - Run it with: `cd test && npm install && npx playwright install chromium`, then start the server with `PORT=8090 node ../server/server.js` and run `node test.js`.
