# Krishna Gera — Portfolio Desktop

A Windows-inspired portfolio desktop with an original blue ribbon wallpaper (not Microsoft's stock wallpaper), compact desktop shortcuts, glass taskbar, classic Explorer-style project folders, and a Chrome-inspired in-app browser.

## Run locally

Open `index.html` in a modern browser. Fonts load from Google Fonts; the desktop shell and wallpaper are local.

## Deploy to Vercel

This is a static site with no build step. Import the GitHub repository into Vercel and use the **Other** framework preset, leave the build command empty, and set the output directory to `.`. Vercel serves `index.html` at the site root, so visitors see the clean domain URL; `vercel.json` also enables clean URLs for HTML pages.

Each page load begins with a brief simulated Windows boot and Krishna Gera sign-in sequence over the portfolio wallpaper before revealing the interactive desktop. This is a portfolio intro animation, not an operating-system boot or authentication flow.

## Add project content

Edit `profile.projects` near the top of `app.js`. AutoSupply, Samjhao, Karya, RestaurantERP, SalonERP, and SportsAcademyERP are already listed. Each project's data supports:

- `name`: folder and app label.
- `readme`: the actual README text to show in the folder's README viewer.
- `appUrl`: the live application URL to open in the in-app browser.

Explorer has location tabs for This PC, Desktop, Downloads, Documents, Photos, and Videos, plus a Recycle Bin shortcut. This PC lists the five user locations; Desktop mirrors the portfolio shortcuts and project folders; locations without supplied content and the Recycle Bin show an honest empty state. Project folders contain only the two known file types: `README.md` and `App` (an Internet Shortcut). Opening a project navigates the current Explorer window; Back, Forward, and Up navigate its history. Use a folder's **Open in new window** context-menu action when a separate window is wanted. Until README text or an app URL is provided, opening either file shows a clear notice instead of invented project details.

Right-clicking an empty desktop area opens the Windows-style context menu. **Display settings** opens a portfolio dialog where visitors can choose small, medium, or large desktop icons. The Recycle Bin shortcut is present but does not claim to store deleted files.

The taskbar clock opens a working date/calendar panel with month navigation. Wi-Fi and battery buttons open quick settings with interactive demo toggles and a brightness slider; these update only the portfolio UI and do not alter device settings. There is no separate About me app.

The taskbar starts with all six project app shortcuts and Chrome pinned. App shortcuts open a tab in the Chrome-style window. Its address bar, tabs, back/forward controls, and search are interactive. Set the LinkedIn, Instagram, X/Twitter, and GitHub URLs in `profile.socials`, and set `profile.resume` to a local PDF path to activate those destinations. This is a browser-like interface inside a webpage, not a bundled Chrome/Chromium browser engine. It can display sites that permit iframe embedding, but browser security and site policies prevent it from rendering some pages (including Google results) inside the portfolio; those pages offer an external-open link instead. A true embedded Chromium browser requires running the portfolio as a desktop app (for example, with Electron or Tauri), not as a regular website.
