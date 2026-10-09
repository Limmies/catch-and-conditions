# Catch and Conditions — phone journal

A static, read-only Supabase journal for GitHub Pages. Map, species totals, daily catches and completed trips share date/species filters. All dates use Africa/Johannesburg. Labels appear at zoom 13; tapping opens details. Nearby markers cluster and overlapping catches spread out when the cluster is opened. Day colours remain stable while changing filters, and repeat after eight days.

## 1. Connect Supabase

The supplied public key is already configured in `config.js`. To replace it later, open your existing project in the Supabase dashboard. Under **Settings → API Keys**, copy the **publishable** key (`sb_publishable_…`). A legacy `anon` key is also supported. Put it in `config.js` as `publishableKey`. It is intentionally public: database row-level security protects the catches. Never use a service-role/secret key, the watch upload token or your password here.

Under **Authentication → Users**, find the existing user whose UUID matches `ownerId` in `config.js`. This is the account that owns your archived catches. Use that user's email and set its password directly in Supabase. If you want a different email, update this same user through Supabase's user management. Creating a separate user will not make the existing catches visible. Do not change the catches' ownership or watch function secrets just to log into the journal.

The login form does not create accounts. For a single-owner project, disable **Allow new users to sign up** in Supabase's Auth configuration. Confirm the live tables retain the owner-only policies from `supabase/migrations/202610070001_fishing_archive.sql`. The site never uses administrator credentials or writes catches.

## 2. Check locally

From this folder:

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

Open `http://127.0.0.1:8766`. Sign in. Compare a real catch against the Supabase table, then check Map, Species and Days. Setup-test records must not appear. Test a date/species filter and sign out. Unsigned visitors should only see the login form. A second account must not be able to read the owner's catches through the database API; the existing SQL migration enforces this with RLS. The owner-ID check in the browser is an additional usability guard, not a security boundary.

## 3. Publish to GitHub Pages

Create a dedicated repository such as `catch-and-conditions`. Upload **only the contents of this `phone-journal` folder**, with `index.html` at the repository root. Retain the `vendor/images` folder and `.nojekyll`. Do not upload the parent watch project, `.private`, configured watch binaries or watch resource settings.

In the repository's **Settings → Pages**, choose **Deploy from a branch**, branch `main`, folder `/(root)`, then Save. Open the URL GitHub supplies after deployment. Pages supports public repositories on GitHub Free; private-repository publishing requires an eligible paid plan. A public site repository contains only the app code and public configuration; the fishing data stays in Supabase behind its login and row-level policies.

If you prefer to upload an archive, extract `catch-and-conditions-github.zip` before uploading; uploading the zip itself will not publish the site.

## 4. Add to iPhone

Open the HTTPS website in **Safari**. Use **Share → Add to Home Screen** and name it **Catch and Conditions**. Open the new green C&C icon and sign in. Safari and the installed app may have separate sessions. A session persists on the device until sign-out or expiry; the password is not saved by the app. Safari's password manager is your choice.

## Limits

- An internet connection is needed to load catches, sign in and display map tiles. Only the public app shell is cached offline; catches, conditions and authentication responses are never cached by the service worker.
- The journal refreshes automatically every minute while visible, when you return after 15 seconds, and when connectivity returns. It loads catches and completed trips; the Refresh button is also available. There is no continuous realtime subscription.
- The Trips page includes completed zero-catch trips after the new trip migration/function are deployed. Fishing/travel time is explicitly recorded on the watch, and unclassified time is retained. Catch-only historical records cannot reconstruct trip duration. Condition enrichment is not implemented in Supabase yet.
- Detail panels show saved scalar condition fields with their recorded units when present. No live weather is substituted for historical catch conditions. Provider formats not yet understood are explicitly marked as undisplayed.
- Live login/data access must be checked after adding the public key and configuring the existing owner's login. Local fixture checks do not prove the deployed database policies.

Pinned libraries are included locally: Supabase JS 2.57.4 (MIT), Leaflet 1.9.4 (BSD-2-Clause), Leaflet.markercluster 1.5.3 (MIT). Licenses are in `vendor`. Map tiles are from OpenStreetMap with attribution.

References: [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [GitHub Pages publishing](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

Fish illustrations reuse the existing darker watch artwork for all eleven species. Images load lazily in species/history rows and display larger in catch details. They are journal illustrations, not identification guides. Keep the `fish/` folder when publishing.
