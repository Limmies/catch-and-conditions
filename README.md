# Phone journal

The live private journal is https://limmies.github.io/catch-and-conditions/. Its deployment repository is `Limmies/catch-and-conditions`; this folder is the maintained source. Publish only its contents, with `index.html` at the repository root. Keep `vendor/`, `fish/mobile/`, licenses and `.nojekyll` together.

## Source

- `app.js`: owner login, one shared paginated refresh path, filters, map, totals, days, trips and catch details. The marked fish-preview block is generated.
- `style.css`: base styles and one mobile layout with safe-area spacing and bottom navigation.
- `sw.js`: public shell and illustration cache only; never authentication, database or map requests.
- `config.js`: public project URL, publishable key, owner UUID and display timezone. Never put a password, watch token or service-role key here.
- `fish/mobile/`: small JPEGs for sharper catch details. All twelve thumbnails are embedded in `app.js`, so individual image-download failures cannot hide the fish.

Map, Species, Days and Trips share species/date filters. Dates use Africa/Johannesburg. Clear the species filter to see zero-catch trips. Fishing/travel totals come from the Supabase trip record; catch rates use recorded fishing intervals. Distances are straight-line totals between catch locations. Setup tests are excluded at the database query.

## Local preview and verification

From the project root:

```sh
python3 -m http.server 8766 --bind 127.0.0.1 --directory phone-journal
python3 tools/package_phone_journal.py
python3 tools/check_connections.py
swift tools/check_phone_journal.swift "$PWD/phone-journal"
```

Open `http://127.0.0.1:8766`. The WebKit check uses synthetic fixtures in an isolated browser, not the real owner session. Packaging validates the public assets and rejects the private watch token. Extract the resulting ZIP before uploading; uploading the ZIP itself does not publish a site.

## Images and updates

Original artwork is retained outside the public folder in `resources/phone-fish-originals/`. After changing it, run `python3 tools/prepare_phone_images.py`. This regenerates 640-pixel JPEGs and 160-pixel embedded previews. Do not hand-edit the generated preview block.

After changing CSS or JS, update their URL versions in both `index.html` and `sw.js`, and increment the shell cache version. Deploy the complete folder. Close and reopen the installed app online to receive an update; it reloads when a new worker takes control.

## Login and iPhone

Use the existing Supabase journal owner account. A different account does not inherit those records. Database row-level security enforces ownership; the browser owner-ID check is only a usability guard. Set passwords directly in Supabase, not in source or chat.

On iPhone, open the live site in Safari → Share → Add to Home Screen. Safari and the installed app may have separate login sessions. Login persists until sign-out or expiry. The app does not store the password.

The journal refreshes on returning, reconnecting and every minute while visible. Catches and trips refresh independently; a failed request retains previously loaded records and displays an error. Sign-out clears in-memory private data. Internet is required for sign-in, archive reads and map tiles. Only the public shell and illustrations are cached offline.

Conditions are collected automatically in Supabase every five minutes, in batches of five catches. The collector backfills older catches and retries provider failures. Catch details and Days show weather at the catch time and location, moon illumination, available marine estimates and a versioned three-fish heuristic. The heuristic is uncalibrated and is not Windy’s score or a bite probability. Missing marine measurements stay unavailable. Record observations to save clarity, measured temperature, local tide/current and notes separately from estimates. Owner-only insertion policies restrict observations; automatic provider snapshots are writable only by the server.

Pinned local libraries: Supabase JS 2.57.4 (MIT), Leaflet 1.9.4 (BSD-2-Clause), Leaflet.markercluster 1.5.3 (MIT). Licenses are in `vendor/`. Map attribution: © OpenStreetMap contributors.

Catch and day conditions include an illustrated moon, estimated sky conditions from saved rain/cloud/visibility data, and a Celsius temperature gauge when units are recorded. Full measurements expand below the visuals. Species uses one table with images, count bars, totals and share.

Species rows use full-width count bars scaled against the most-caught species, in the same colour as map markers, alongside counts and share percentages. The conditions card shows three custom fish with 0–3 active: percentage bands below 25%, 25–49%, 50–74%, and 75–100%. The percentage is derived from the saved model inputs; missing inputs show an unavailable rating.

The field-guide theme uses local Georgia/Times serif typography, small-cap headings and italic captions. Faded Kabeljou, Red Steenbras and Red Stumpnose illustrations decorate page backgrounds; the three public images are included in the offline shell. The artwork is decorative and does not represent catch data.

Scientific captions cover all twelve journal categories in Species and catch details.
Owner-specified categories: Black Musselcracker (Cymatoceps nasutus), Blacktip Reef Shark (Carcharhinus melanopterus), and South African Hake interpreted as shallow-water Cape hake (Merluccius capensis). Existing upload IDs remain unchanged. Location alone cannot distinguish the two Cape hake species.
References: [DFFE species guide](https://www.dffe.gov.za/sites/default/files/docs/publications/marinerecreationalactivity_informationbrochure2016to2017.pdf),
[SASAA records](https://kznsaa.co.za/wp-content/uploads/2023/01/2022-Ladies-Records-July-2022.pdf),
[ORI black musselcracker factsheet](https://www.saambr.org.za/wp-content/uploads/2023/07/ORI-Fish-Fact-Black-musselcracker-ZC-LB-2.pdf),
and [South African shark checklist](https://sharksunderattackcampaign.co.za/wp-content/uploads/2022/03/2-Ebert-et-al-SA-Checklist-2021_E1342.pdf), and [Cape hake identification](https://www.fishbase.se/summary/Merluccius-capensis.html).

Cape Yellowtail / Kaapse Geelstert (*Seriola lalandi*) uses stable ID `yellowtail`, appended after the original eleven species. Its gold colour, thumbnail, portrait, scientific caption, filters, summaries and condition collection use the shared journal paths.

Fish profiles are available from Species buttons, species filter selection and catch details. Short editorial summaries cover behaviour, life history and an interesting fact, with per-species source links to ORI/SAAMBR, SANBI, Florida Museum or the red steenbras longevity study. They are reference content, separate from catch records and fishing predictions. Hake and shark profiles clarify category identification limits.

Map uses the original OpenStreetMap street tiles with a metric scale. The Old chart style checkbox applies optional parchment colouring to the basemap only; catch colours remain unchanged. Alternative low-resolution layers have been removed.
