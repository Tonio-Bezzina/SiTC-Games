LAB HERO - PROTOTYPE 1

FILES
-----
index.html  - Game page
style.css   - 16:9 layout, landscape handling and styling
game.js     - Game interactions and fullscreen behaviour

HOW TO TEST LOCALLY
-------------------
1. Extract the ZIP file.
2. Double-click index.html.
3. Press Play.
4. Try resizing the browser window.
5. The game should always remain 16:9.
6. On a phone/tablet in portrait orientation, the game is covered by
   a "Turn your device" message.

IMPORTANT BROWSER LIMITATION
----------------------------
A website cannot guarantee orientation locking or fullscreen on every browser.
The game therefore does both:
- requests fullscreen / landscape when the user presses Play; and
- visually blocks the game whenever the device is in portrait mode.

That means the gameplay remains landscape-only even on browsers that refuse
the orientation lock request.

NEXT STEP
---------
Host these files using a static web host such as GitHub Pages, Cloudflare Pages,
Netlify or Vercel. The Wix website can then link its Play button to the hosted
game URL.
