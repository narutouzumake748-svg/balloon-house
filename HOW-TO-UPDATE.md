# Balloon House Website — How to Update

Once the one-time setup below is done, everyday updates happen through a simple
admin panel in your browser — no code editing required.

## Everyday use: the Admin Panel

1. Go to `yoursite.netlify.app/admin` (replace with your real site address) and
   log in with the email you were invited with.
2. Click **Gallery Photos** to add, edit, or remove event photos:
   - Click into the "Gallery" entry, then **Add** under Photos.
   - Upload a picture from your phone or computer, write a short description,
     and pick a category (Birthday / Wedding / Corporate / Baby Shower).
   - Click **Publish**. The live site updates automatically within about a
     minute.
3. Click **Site Settings** to update your WhatsApp number, phone, email,
   Instagram link, or current city/state — same Publish button, same ~1 minute
   update time.

That's it — everything customers see (photos, categories, contact info,
location) is editable from this one screen on any device, including a phone.

## Set up the live "Latest from Instagram" section
This is separate from the admin panel above (it's a display widget, not content
you manage manually):
1. Go to a free Instagram embed service — [SnapWidget](https://snapwidget.com) or
   [Elfsight](https://elfsight.com/instagram-feed-instashow).
2. Enter the Instagram username (`balloonhouse25`) and generate an embed code.
3. Open `index.html`, find `<section id="instagram"`, and replace the
   `<div class="instagram-placeholder">...</div>` block with that embed code.
4. Save, redeploy (see below), and it'll show live posts automatically going
   forward.

## One-time setup (do this once, before the admin panel works)
The admin panel needs the site hosted on Netlify **connected to a GitHub
repository** (not drag-and-drop) plus Netlify Identity turned on. All free:

1. Create a free [GitHub](https://github.com) account (if you don't have one)
   and push this project to a new repository.
2. Create a free [Netlify](https://netlify.com) account, choose "Import an
   existing project," and connect it to that GitHub repository. Leave build
   settings blank (this is a plain static site — no build command needed).
3. In the Netlify site dashboard, go to **Identity** → **Enable Identity**.
4. Under Identity settings, go to **Services** → **Git Gateway** → **Enable
   Git Gateway**.
5. Still under Identity, click **Invite users** and send an invite to your
   friend's email — they'll set a password and can then log in at `/admin`.
6. (Optional) Under Identity → Registration, set it to "Invite only" so
   strangers can't self-register as admins.

After this, every future update happens purely through the `/admin` panel —
no one needs to touch GitHub, Netlify, or code again.

## Fallback: editing data directly (no admin panel needed)
If you ever want to skip the admin panel, the same content lives in two plain
files you can hand-edit and redeploy:
- `data/gallery.json` — the list of gallery photos and categories
- `data/settings.json` — contact info and location

## Notes
- The gallery currently uses placeholder illustrations in `images/gallery/`.
  Replace them with real event photos via the admin panel as soon as they're
  ready — that's the most important update.
- The "Send Inquiry" form opens WhatsApp with the customer's details pre-filled
  — no email server or backend needed.
