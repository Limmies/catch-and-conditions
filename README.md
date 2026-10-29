# Phone journal

The live private journal is https://limmies.github.io/catch-and-conditions/. Its deployment repository is `Limmies/catch-and-conditions`; this folder is the maintained source. Publish only its contents, with `index.html` at the repository root. Keep `vendor/`, `fish/mobile/`, licenses and `.nojekyll` together.

## Source

- `app.js`: owner login, one shared paginated refresh path, filters, map, totals, days, trips and catch details. The marked fish-preview block is generated.
- `style.css`: base styles and one mobile layout with safe-area spacing and bottom navigation.
- `sw.js`: public shell and illustration cache only; never authentication, database or map requests.
- `config.js`: public project URL, publishable key, owner UUID and display timezone. Never put a password, watch token or service-role key here.
- `fish/mobile/`: small JPEGs for sharper catch details. All twenty-five thumbnails are embedded in `app.js`, so individual image-download failures cannot hide the fish.

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
Owner-specified categories: Black Musselcracker (Cymatoceps nasutus), Shark (Selachimorpha; unspecified species), and South African Hake interpreted as shallow-water Cape hake (Merluccius capensis). Existing upload IDs remain unchanged. Location alone cannot distinguish the two Cape hake species.
References: [DFFE species guide](https://www.dffe.gov.za/sites/default/files/docs/publications/marinerecreationalactivity_informationbrochure2016to2017.pdf),
[SASAA records](https://kznsaa.co.za/wp-content/uploads/2023/01/2022-Ladies-Records-July-2022.pdf),
[ORI black musselcracker factsheet](https://www.saambr.org.za/wp-content/uploads/2023/07/ORI-Fish-Fact-Black-musselcracker-ZC-LB-2.pdf),
and [South African shark checklist](https://sharksunderattackcampaign.co.za/wp-content/uploads/2022/03/2-Ebert-et-al-SA-Checklist-2021_E1342.pdf), and [Cape hake identification](https://www.fishbase.se/summary/Merluccius-capensis.html).

Cape Yellowtail / Kaapse Geelstert (*Seriola lalandi*) uses stable ID `yellowtail`, appended after the original eleven species. Its gold colour, thumbnail, portrait, scientific caption, filters, summaries and condition collection use the shared journal paths.

Fish profiles are available from Species buttons, species filter selection and catch details. Short editorial summaries cover behaviour, life history and an interesting fact, with per-species source links to ORI/SAAMBR, SANBI, Florida Museum or the red steenbras longevity study. They are reference content, separate from catch records and fishing predictions. Hake and shark profiles clarify category identification limits.

Map uses the original OpenStreetMap street tiles with a metric scale. The Old chart style checkbox applies optional parchment colouring to the basemap only; catch colours remain unchanged. Alternative low-resolution layers have been removed.

Silver kob correction (17 October 2026): `kabeljo` identifies Silver Kob (*Argyrosomus inodorus*). The legacy ID and original capture labels/payloads are preserved; watch and journal retain the familiar display name Kabeljou; scientific captions and facts describe Silver kob. Reference: https://saambr.org.za/wp-content/uploads/2023/03/ORI-Fish-Fact-Silver-Kob-ZC-LB.pdf

Species profiles use illustrated cards beneath the fun-facts story: oldest documented specimen age, recreational minimum size, diet and movement. Ages are maxima from linked references, with regional and captive records explicitly labelled; they are not estimates for a logged catch. The age card uses a large year figure and growth-ring illustration. Legal size includes kob regional/method exceptions and the red steenbras closure.

Dageraad and Scotsman (17 October 2026): stable IDs `dageraad` and `scotsman` are appended. The watch has fourteen fish plus No bite; prior picker IDs are unchanged. Both have transparent watch artwork, journal previews/portraits, scientific captions, fun facts and reference cards. Dageraad: Chrysoblephus cristiceps, recorded age 22 years. Scotsman: Polysteganus praeorbitalis, recorded age 13 years in the cited account. Both have 40 cm recreational minimum sizes and one-fish daily bag limits in the ORI reference.

Water temperature is displayed beside air temperature in catch and day conditions. Saved measured observations are labelled separately from modelled sea-surface estimates; the air value cannot hide the water value. Unavailable water readings have an explicit empty-state card, not a guessed number.

Shark category (18 October 2026): `haai` now displays Shark on the watch and journal and covers any shark species. Scientific grouping is Selachimorpha, which includes multiple families. General biology replaces blacktip-specific claims; lifespan and rules depend on species. Original records and IDs remain intact.

See Baber (18 October 2026): `sea_barbel` is Galeichthys feliceps (white seacatfish / white seabarbel, Ariidae). Appended at watch index 15; all previous fish and No bite IDs unchanged. The journal now has fifteen fish categories including generic Shark, with artwork, facts and reference cards. The watch build is prepared for later installation, per owner request.

Mackerel / Makriel (18 October 2026): appended stable ID `mackerel`, watch index 16 / Fish15. Local taxonomy Scomber colias (SAIAB); older plate uses japonicus. Clean alpha artwork, profile, sourced study maximum age, diet and shoaling movement. Upload validation and species directory updated. Sixteen biological categories; watch build prepared for later installation.

## Shore and Offshore — 18 October 2026

Use the Fishing style buttons above the tabs: **Offshore** (default), **Shore**, or **All fishing**. Map markers, species lists, totals, days, completed trips and catch rates follow the selected style and existing date/species filters. The preference stays in this browser. Each catch detail also shows its captured style.

Offshore retains the existing sixteen species. Shore has Blacktail, Belman, Galjoen, Shad / Elf, Red Roman, Dusky Kob, Spotted Grunter, White Steenbras, Garrick / Leervis and Zebra / Wildeperd. Red Roman uses one shared species ID. Offshore Kabeljou remains silver kob (Argyrosomus inodorus); shore Dusky Kob has a separate ID and profile (Argyrosomus japonicus).

Every new watch capture, including No bite, and every completed trip carries `fishing_mode`. Legacy raw payloads remain unchanged and are classified Offshore. The website filters the **captured mode**, never guesses the mode from the species or GPS location. A shared Red Roman catch can therefore belong to either style without mixing totals.

The supplied PESCADO plates are retained as original labelled JPEGs in `resources/fish-originals/shore-pescado/` in the private development workspace, with source URLs. No AI-redrawn artwork is used for this section. `tools/prepare_shore_artwork.py` trims paper/captions and makes only connected outer white paper transparent; it verifies that every retained RGB pixel is unchanged. It does not change anatomy, colours, contrast or proportions. Original full plates retain the printed artist credit; the website also credits PESCADO below the species information. Rebuild mobile derivatives with `tools/prepare_phone_images.py`. The package checker verifies that both watch mode lists match the website.

Santer transparency (18 October 2026): Santer uses the existing transparent source as PNG for its embedded preview and full portrait; JPEG cannot retain alpha. Other images keep their existing formats. The Santer brightness adjustment remains on the fish, and transparent pixels show the page background. Shell v33 / image cache v3 replace the previous opaque cached image.

Map interaction repair (18 October 2026): single fish markers open catch details; numbered groups open a scrollable catch chooser with species, date and time, without automatic cluster zoom. Mouse-wheel and pinch zoom are available alongside +/− and dragging. Marker hit areas are larger. Duplicate archive records are removed during paginated reads and marker rendering; different catches at identical coordinates remain separate. Tooltips are non-interactive and only rebound when their zoom visibility changes.

White Musselcracker / Brusher (18 October 2026): `white_musselcracker`, Sparodon durbanensis, is shore-only, separate from Black Musselcracker (`musselcracker`). Appended watch index 26 / Fish25; eleven shore species plus No bite. Original supplied adult/juvenile plate retained; no redraws. Profile includes diet, habitat movement, 31+ years documented in the Eastern Cape study, and 60 cm / two-fish daily recreational limits. Watch installer prepared for later installation.

Map viewport: automatic fit and popup auto-pan removed; page scrolling no longer changes zoom. Only deliberate +/−, pinch and Show all spots change zoom. Refresh, filtering and rendering preserve the chosen viewport.

Map controls simplified (18 October 2026): clicking a numbered cluster spider-spreads its catches at the current zoom; the temporary catch chooser has been removed. Mouse wheel, double-click, pinch and +/− provide ordinary zoom controls. Drag inertia and map/cluster animations are disabled. Unchanged background refreshes retain marker layers and open spider spreads, and map size checks do not pan. No automatic fitting occurs; Show all spots is the explicit fit action.

Catch details now focus on conditions: species fun facts remain in species profiles. Barometric sea-level pressure and the saved three-hour pressure change appear in a dedicated card; missing readings are labelled unavailable. Shell v37.

Watch fish length (shell v40): new catches include integer `length_cm` in the original raw payload and display it in catch details. Legacy catches remain unchanged. Watch flow is species → length → save, Up/Down by 1 cm, with no confirmation. No bite bypasses length. Starting length is the last saved length of that species across all trips and watch restarts; otherwise Set length requires adjustment before saving. Pending selection preserves its timestamp and first available GPS fix. Back cancels the pending catch.

Environmental intelligence (19 October 2026, shell v41): catch details retain current conditions and add a collapsed Previous 72 hours panel. It reads owner-protected event-relative histories and labels missing/partial data. V2 snapshots supersede V1 for display only; original V1 data remains saved. Backend includes daily shared provider history, 3/6/12/24/48/72-hour summaries, astronomy and estimated GEBCO depth; no calibrated prediction model is deployed. Optional watch trip settings remember anglers and active lines without extra catch steps. See private development docs/ENVIRONMENTAL_INTELLIGENCE.md and docs/MARINE_INTEGRATION.md for provenance, limitations and hardware integration.

Trip movement review (22 October 2026, shell v48): Trips now use individual cards with chronological activity timelines, fishing/travel/unclassified shares, five-minute GPS speed ranges and averages, and expandable recording feedback and interval logs. Blank chart areas mean no saved samples. Unclassified time is broken down by recorded reason, including GPS gaps, app-resume gaps and launch exclusions. Saved detector settings appear per trip; classification coverage is not an accuracy score. Existing historical labels and watch thresholds are preserved. See `docs/TRIP_MOVEMENT_REVIEW.md` in the development workspace for the recent drive-test assessment.

Trip charts (23 October 2026, shell v49): tap or keyboard-select a timeline interval to show its exact times and label. Each trip displays classification coverage, its largest unknown cause and proportional gap-reason bars without expanding details. On small screens the speed chart scrolls horizontally to retain readable labels. Updated watch corrections hold the user's explicit activity label for ten minutes during GPS loss; missing GPS returns to unknown at expiry. Historical totals are preserved.

Session productivity (23 October 2026, shell v50): each trip displays saved fishing sessions with duration, catches, species, catches/hour and available angler/line effort rates. Zero-catch sessions are retained. The spot comparison groups session location anchors within 30 metres of fixed unnamed spots, separately for Shore/Offshore. It weights rates by all eligible fishing seconds, including zero-catch sessions. Locations without evidence remain unlocated; drifting sessions may extend beyond their anchor. Database triggers maintain session records when trips or late catches sync. Existing saved intervals are backfilled; no new watch build is required for this storage feature.

Layout cleanup (24 October 2026, shell v51): five destinations—Map, Species, Days, Trips and Spots—with compact shared controls and labelled mobile navigation. Spot comparison has a dedicated page. Trips show essential metrics first; sessions, full totals and GPS recording details expand without losing content. Map options group chart style and colouring. Day catch lists and trip panels preserve expansion across background refresh. Species filters no longer open a profile automatically; use Read about this species or a species row. Catch dialogs separate the primary record from GPS metadata and group previous-weather history beneath the observation/update actions. All existing content, measurements, profiles, sources and forms remain available. See docs/JOURNAL_LAYOUT.md in the development workspace.

Minimal view (24 October 2026, shell v52): removed repeated descriptions, general footnotes and help paragraphs. Larger species illustrations, simple page labels, proportional trip-time bars and concise spot/session cards lead the interface. Scientific names and references remain in the species guides; measurement sources and recorded effort expand on demand. Raw coordinates become a View on map action. Unavailable readings, estimate labels, real error/status messages and all existing forms remain intact.

Shell v56 requires sign-in after every fresh opening or reload. Sessions remain only in memory while the page is open; credentials are not stored by the app. Initial records load behind a small fish indicator. Updates apply on the next opening without interrupting active forms.

Shell v57 shows coordinates below spot names and opens their 20m anchor on the in-app map. On computers, click tabs to toggle up to two side-by-side views; double-click one to isolate it. Phones retain a single page. The persisted radius is now 20m (previously 30m); see docs/FISHING_SESSIONS.md for the migration audit.

Shell v58 uses full browser width on desktop, a larger map and two equal panes. Selecting a third tab replaces the right pane, retaining the left; double-click still isolates one view. View order follows selection order. Mobile remains single-page.

Shell v59 clarifies Refresh catch weather as modelled weather/history for the selected catch's time/location. Catch-specific observation entry is removed; use Days → Rate this day. Day ratings use matching SVG illustrations instead of emojis. Existing saved observations remain readable.

Shell v60 carries the fisherman's diary theme throughout: paper entries, small tape details, spot-note cards, a lined day-notes editor and matching SVG weather/rating illustrations. Data and interactions are unchanged.

Shell v61 extends scrapbook paper/index-card styling across all views and restores the faded fish background and heading artwork using current offline-cached PNG files. Shore/offshore artwork follows the style filter.

Shell v62 adds Home before Map with an introduction, goals, Garmin workflow and ten original fishing photographs presented as a scrapbook. It is the default page after login when no specific view is linked. Six tabs work on phones; desktop two-pane behavior remains. Web photos are optimized and included in the offline shell; source originals stay outside the published site.

Shell v63 adds the owner's actual photo stories and a bottom scrapbook album of 21 remaining selected photos. Use Previous/Next, keyboard arrows/Home/End, or horizontal swipes; vertical scrolling stays normal. Album photos cache as they are opened, without adding to the initial offline-shell download.

Shell v64 curates the Home story using the owner's exact selected originals, keeps the release sequence together and moves the blue santer below the opening. Eleven main photos and sixteen album pages retain uncropped scrapbook prints.

Shell v97 adds a private photo to each fishing day (Days → expand a day → Add day photo). Photos are shared across fishing-mode views of the same date, resized to JPEG up to 1600px and stored in the private fishing-day-photos bucket under the signed-in owner's UUID/date.jpg. Authenticated downloads create temporary in-memory blob URLs, cleared on sign-out; photos are never packaged or service-worker cached. Replace and Remove operate on that date's photo. Original image inputs are capped at 20 MB; unsupported formats report an error. Long Insights category charts scroll within their cards, with extra space for labels.

Shell v100 is the final presentation cleanup: shorter Home explanations, opt-in album playback, a clearer Density map tab, consistent card spacing and keyboard focus, and a simpler Insights comparison with advanced options collapsed. Enjoyment and Bite activity remain the only Insights day ratings. Day photos now reconcile additions, replacements and removals from other devices on refresh. Existing records, private photos, spot names and watch integration are preserved. Run the isolated WebKit checks across all six pages; set JOURNAL_SCREENSHOTS to a temporary directory for optional phone/desktop review screenshots.

Shell v101 makes both maps scroll-safe: ordinary mouse-wheel/parallel trackpad scrolling is left to the page, while touch pinch, trackpad pinch (Ctrl+wheel and Safari gesture events), keyboard and zoom buttons remain available. South Africa overview limits adapt to pane width as well as height, reset correctly when a wide pane shrinks, and use a regional pan boundary. Base tiles disable world wrapping.

Shell v102 smooths pinch zoom using fractional zoom levels and animation-frame easing rather than delayed whole-level steps. Touch pinch and zoom buttons support fractional levels; ordinary scrolling remains page scrolling and the regional zoom limit is retained. Reduced-motion preferences disable the easing.

Shell v103 explains the journal's personal research mission, limited fishing time, use of fish-finder technology and ten-year learning goal for a general audience. Home includes a field/unit guide checked against saved model data, separates API estimates from calculations and watch records, and preserves the photo collection. The album automatically cycles every five seconds while visible, with Previous/Next and swipe navigation and no Play/Pause button. Includes the pending fractional pinch-zoom smoothing fix.

Shell v104 starts both density maps at a 500 metre smoothing radius on each fresh opening or sign-in. The slider and automatic-radius option remain available.
