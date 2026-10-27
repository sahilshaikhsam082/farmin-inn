# Farming Inn, Indore

Website for Farming Inn, a farm-stay hotel in Indore, Madhya Pradesh. Built with HTML, CSS, Bootstrap 5 and plain JavaScript. There is no build step.

## Structure

```
index.html          single-page site
css/style.css       all custom styles
js/main.js          interactions, booking form, gallery lightbox
assets/favicon.svg  site icon
CNAME               custom domain for GitHub Pages
.nojekyll           serve files as-is on GitHub Pages
```

## Before going live

1. **Contact details:** open `js/main.js` and set your WhatsApp number, phone and emails in `CONFIG` at the top.
2. **Address & map:** in `index.html`, update the address in the Contact section and the Google Maps `iframe` `src`.
3. **Prices & rooms:** edit the three room cards in the Rooms section.
4. **Photos:** the site uses Unsplash stock photos. Replace them with real photos of the property (for example in `assets/img/`) and update the `src` paths.
5. **Social links:** replace the `#` links in the Contact section.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "Initial Farming Inn website"
git branch -M main
git remote add origin https://github.com/<your-username>/farming-inn.git
git push -u origin main
```

Then on GitHub, go to **Settings → Pages**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save.

### Custom domain

The `CNAME` file points to `farming-inn.com`. At your domain registrar, add:

- `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `CNAME` record for `www` → `<your-username>.github.io`

Then turn on **Enforce HTTPS** under Settings → Pages. If you are not using a custom domain yet, delete the `CNAME` file.
