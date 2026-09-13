# Website release checklist

Prepared: July 31, 2026. Last synced with `dina-app`: September 12, 2026.

## Release scope

- DinaLab homepage
- Admin Toolkit for Salesforce product page, privacy policy, and EN/JP manual
- Sheet for Salesforce release-candidate page and privacy policy
- SheetConnect for Salesforce release-candidate page and privacy policy
- Agent for Salesforce product page and privacy policy
- Business guides blog
- Common Tools
- Legacy URL redirects

## Completed in this release

- [x] Full sync against `dina-app` on September 12, 2026: every extension's manifest name and version checked against the site, plus its shipping mark and privacy policy. Findings below.
- [x] Admin Toolkit 0.9.1 to **0.10.0**: product page, homepage card, and current-focus board updated; Winter '27 Release Review added as the seventh app; Org Review rewritten as a composed pipeline; the new sandbox-only permission-set-assignment write path and the `api.status.salesforce.com` Trust-status read disclosed; privacy policy rebuilt from the September 11 source of record, which the site's copy predated by five weeks.
- [x] Admin Toolkit now ships the **Three Tone Fan** mark in indigo, so the site carries that artwork instead of the neon D and its entry was removed from `scripts/build-logos.mjs`.
- [x] **DinaSheet renamed to Sheet for Salesforce** throughout the site: product page, Japanese page, both manuals, privacy policy, homepage, blog, and the 404 navigation. Folder paths, the Chrome Web Store item and its URL slug are unchanged, matching the rename decision in `dina-app` to keep internal paths and compatibility identifiers as they were.
- [x] Dock for Salesforce moved from "In development" to **Free local beta 0.1.0**, which matches its prepared Store submission and release candidate.
- [ ] Give the Admin Toolkit manual a **0.10.0** pass. It still documents 0.9.0 — no Org Differences chapter, no Org Review pipeline, no Winter '27 page, and the popup capture shows five apps rather than seven. This supersedes the earlier 0.9.1 manual item below.
- [ ] Recapture the Admin Toolkit Store and manual screenshots that show the retired neon-D mark. Frames that do not show the mark do not need reshooting.
- [ ] Resolve the **Agent naming mismatch**. The site calls it `Agent for Salesforce`; `Dina Agent for Salesforce/manifest.json` and its Store submission doc still say `Dina Agent for Salesforce`. The site name is the decided public one, so the source needs the rename before any submission — the earlier checklist entry claiming this was done was wrong.
- [ ] Decide what to do with the historical "DinaSheet engine" phrase in the Admin Toolkit 0.8.0 release notes. It appears in both manuals, in `manual/_build/scenes.mjs`, and as a translation key in `assets/site-language.js`, so the four must change together. It is accurate as a record of what 0.8.0 shipped, so it is currently left alone.

- [x] Publish the SheetConnect for Salesforce release-candidate page and privacy policy, add the product to the homepage products grid and current-focus board, and register both pages in the sitemap, 404 navigation, and site validation.
- [x] Use the shipping SheetConnect mark on the site: `apps/sheetconnect-for-salesforce/logo.svg` is copied from `SheetConnect for Salesforce Store Assets/source/brand-mark-master.svg` in `dina-app`, so the homepage card, the packaged extension icon and the Chrome Web Store icon are the same artwork. It is outside `scripts/build-logos.mjs`, so regenerating the neon-D marks leaves it alone.
- [ ] Enter `https://dina.jp/apps/sheetconnect-for-salesforce/PRIVACY_POLICY.html` in the Chrome Web Store listing once this deploy is live. This URL is SheetConnect submission blocker 2; the page must resolve publicly before the listing is saved.
- [x] Resync the site with the DinaConnect to SheetConnect rename on September 12, 2026: page and folder renamed, screenshots re-copied from the regenerated store assets, the panel's optional Google host permissions and its new English/Japanese selector added, and the release status updated now that the OAuth client is bound.
- [x] Re-copy `03-search-and-import-reports.png` and `04-validate-before-writing-back.png` after `dina-app` commit `cb186410` dropped the panel's Save button and re-captured the store screenshots. All five frames on the product page now hash-match `SheetConnect for Salesforce Store Assets/screenshots`.
- [ ] Re-check the SheetConnect page against `dina-app` at submission time: the version, the reproducible-build claim, and the permission list must still match `SHEETCONNECT_CHROME_WEB_STORE_SUBMISSION.md`. If the manifest is bumped to 0.1.1, update the hero pill, the homepage status pill, the current-focus board, and the release-status section.
- [ ] Confirm the SheetConnect Japanese homepage strings read correctly; the product card and current-focus row are newly written and have not had native-language review.
- [x] Adopted **Solar** as the DinaLab house mark. `Dina Brand PM/logo-master/manifest.json` now carries a `resolved` block naming it after eight rounds of decisions, superseding the Prism Fan answer from round 1. It replaces the neon-D mark in every page header, on the blog and Agent pages that were still on a stale PNG, on the twelve pages showing a plain bordered letter D, and in `favicon.svg`. The manual generator emits it too, so regenerating no longer reverts it — verified by regenerating and diffing both languages. The retired `assets/dina-app-logo-{light,dark}.svg` pair and its generator block are gone, along with the dark-theme image swap, because the tile carries its own ground.
- [x] Followed the master's own guidance on the letterform. Solar's white D is 1.59 contrast on gold, below the family's 3.99 floor, which the manifest documents as deliberate with the cost named: soft at 16px. Confirmed by eye at 16px, so the header uses the white D and `favicon.svg` uses the `dina-master-ink` variant the manifest supplies for exactly that case.
- [x] Adopted the approved brand marks from `dina-app` for every product that has one. `Dina Brand PM/logo-final/` is the master; `scripts/sync-brand-marks.mjs` copies its seven marks into the site and `--check` fails on drift. Admin Toolkit, SheetConnect, Agent, Dock, DevOps, Voice and Prompter now carry the three-tone fan, and their entries were removed from `scripts/build-logos.mjs` so it cannot clobber them. Card accents follow each mark's mid-tone.
- [ ] Decide what Sheet for Salesforce should carry. It is the only product on the homepage with no entry in the brand manifest — its emerald grid slot was reassigned to SheetConnect — so it is still on a generated neon-D mark and is now the one card in a different visual language. It needs either its own manifest entry in `dina-app` or a deliberate decision to leave it.
- [ ] Note that Agent, Dock, DevOps, Voice and Prompter now show a mark on the site that their shipping extension does not use yet; only Admin Toolkit and SheetConnect ship the fan today. Re-check when those five next build.
- [x] Superseded: the earlier question about whether to move the homepage marks.

- [x] Replace the Admin Toolkit and Dina Agent raster logos with the current vector marks from `dina-app`, and drop the duplicate `assets/salesforce-agentic-bot-icon.jpg` reference.
- [x] Rebuild all ten business app marks from the exact frame and D geometry in `assets/dinalab-logo.svg`, with a distinct palette and functional glyph for each product.
- [x] Rewrite the homepage as a business product site organized around Salesforce administration, data operations, governance, and context-aware AI.
- [x] Keep only the current business roadmap apps on the homepage: DevOps for Salesforce, Dock for Salesforce, Prompter for Salesforce, and Voice for Salesforce.
- [x] Sync Dina Agent homepage, product, status, and privacy content with version 0.5.0 in the `dina-app` source.
- [x] Add a business blog hub with guides for release org review, safer bulk data updates, and AI credential boundaries.
- [x] Add a dedicated business social-preview image and Open Graph/X metadata.
- [ ] Confirm the new business homepage, Dina Agent, and blog copy reads correctly in Japanese; the strings are newly written and have not received native-language review.
- [ ] Confirm each business roadmap status is still accurate at publish time: DevOps for Salesforce beta 0.1.0, Dock for Salesforce in development 0.1.0, Prompter for Salesforce in development 0.1.0, and Voice for Salesforce prototype 0.1.1.
- [x] Remove Dina Bot for Salesforce, Dina Agent for iOS, and Sheet for Salesforce for Google Sheets from the homepage while retaining their legacy asset folders.
- [x] Remove consumer and creative apps from the business homepage. Their legacy folders and assets remain untouched because they may still serve direct or external URLs.
- [ ] Confirm Admin Toolkit 0.10.0 and Sheet for Salesforce 0.3.2 store status before publish. Both are validated release candidates in `dina-app` awaiting upload, and the pages frame them as the next release; the published Store items are still 0.9.0 and the earlier Sheet for Salesforce build.
- [x] Correct the Admin Toolkit product page against the 0.9.1 source: Metadata Admin is view-only rather than locally editable, the extension requests only `cookies` and `storage`, and Org Differences is now a sixth app.
- [x] Rewrite the Dina Agent product page for 0.5.0, covering the combined business workspaces, advisory AI panel, extension-local Salesforce tools, bounded context, Google account, and honest paid-production gates.
- [x] Expand the Dina Agent route into a Stripe Japan review-oriented business page with clear audience, product scope, USD pricing, non-live sales status, Stripe Checkout and Customer Portal disclosures, support placeholders, and legal navigation.
- [x] Add a dedicated `特定商取引法に基づく表記` page covering seller, address, phone, email, pricing, payment timing, delivery, cancellation, and refund fields without inventing owner information.
- [ ] Replace every Dina Agent `[OWNER INPUT REQUIRED]` and `[OWNER DECISION REQUIRED]` placeholder with owner-approved seller, contact, tax, delivery, cancellation, and refund information before paid sales open.
- [x] Reconcile `manual/_build` with the published manual. The generator had drifted back to 0.8.0 content — section 5 was still GitHub Metadata Sync and the 0.9.0 release notes were missing — so the documented regenerate command would have reverted the manual. It now reproduces the published pages exactly, and section intros can carry a callout.
- [ ] Give the manual a 0.9.1 pass once that release ships: Org Differences as its own app chapter, Metadata Admin change-set retrieval, a six-app popup capture, and the 0.9.1 release notes. The manual currently documents 0.9.0, which is what the Store serves.
- [x] Move every page onto one design system (`assets/dinalab.css`), replacing the three divergent palettes previously inlined per page.
- [x] Add a light/dark theme with a nav toggle, a shared preference key, and no flash of the wrong theme on navigation.
- [x] Apply the Japanese font stack site-wide; previously only the homepage and Sheet for Salesforce pages carried CJK fallbacks.
- [x] Rebuild the homepage around sharing knowledge, tools, and ideas, and retire the demo and style-guide pages into `index.html` and `assets/dinalab.css`.
- [x] Update Admin Toolkit public content for v0.8.0, SheetD, and GitHub Metadata Sync.
- [x] Publish the Sheet for Salesforce v0.2.0 release-candidate page and privacy-policy URL.
- [x] Add Sheet for Salesforce to the homepage, sitemap, site validation, and not-found navigation.
- [x] Publish Sheet for Salesforce product pages and screenshot manuals in English and Japanese.
- [x] Keep the requested `Admin Toolkit for Salesforce` product name consistent across the extension, website, manual, privacy policy, and Store materials.
- [x] Use Salesforce in the product name as a compatibility reference and retain clear independence language.
- [x] Add Salesforce trademark attribution and independence language to primary product surfaces.
- [x] Rename Google Cloud Functions copy to the current Cloud Run functions product name.
- [x] Replace personal/portfolio wording with consistent studio and business-facing language.
- [x] Keep privacy disclosures aligned with the described data flows.
- [x] Keep the Chrome Web Store Limited Use disclosure in all extension privacy policies.
- [x] Move stale legacy product and privacy pages to canonical redirects.
- [x] Make the EN/JP manual reproducible from its generator without losing the stored language preference.
- [x] Add canonical metadata to primary public pages.

## Required external actions before publishing

- [ ] Deploy this site before saving the SheetConnect Chrome Web Store listing, so its privacy-policy URL resolves. The repository feeds two hosts. The Firebase Hosting mirror `dina-home.web.app` was deployed on September 12, 2026 (`node scripts/build-firebase-public.mjs && npx firebase-tools deploy --only hosting:homepage`) and serves the SheetConnect page, its privacy policy and all five screenshots. GitHub Pages on `dina.jp` — the host the listing URL points at — is still unpublished and 404s on both SheetConnect paths; publish it with `./git-push.sh "<message>"`.
- [x] Bind the SheetConnect Google OAuth client to the extension ID — done and verified in the Cloud Console on September 12, 2026.
- [ ] Verify the Google Cloud project and start OAuth verification for the sensitive `spreadsheets` scope. The page promises no listing date because that review is the long pole.
- [ ] Run the SheetConnect live end-to-end test, then submit the package, store icon, promotional tiles, and screenshots to the Chrome Web Store.
- [ ] After uploading, check the draft item's title, summary and screenshots in the dashboard. The draft was created as DinaConnect and the old listing assets are still attached to it; the manifest key pins the extension ID, so the upload renames the item in place.
- [ ] Replace the SheetConnect "not yet on the Chrome Web Store" hero pill and the homepage release-candidate status with an install link once the item is live.

- [ ] Submit the Sheet for Salesforce v0.3.2 package, store icon, promotional tiles, and screenshots to the Chrome Web Store.
- [ ] Confirm the Sheet for Salesforce Store privacy declarations match its current permissions, local update receipts, and published privacy policy.
- [x] Keep the extension manifest and user-visible extension UI named `Admin Toolkit for Salesforce` in the extension source repository.
- [ ] Confirm the Chrome Web Store item remains named `Admin Toolkit for Salesforce` and update its description and screenshots for version 0.10.0.
- [ ] Confirm the Chrome Web Store privacy declarations exactly match the current extension behavior and the published privacy policy.
- [ ] Confirm the Store single-purpose statement describes one narrow focus area: Salesforce administration and development workflows.
- [ ] Verify the developer support email and privacy-policy URL in the Chrome Web Store dashboard.
- [ ] Rename the draft assistant in its source repository to `Agent for Salesforce` before any public submission. Not done: the manifest still reads `Dina Agent for Salesforce`.
- [x] Exclude Salesforce session IDs, access tokens, cookies, authorization headers, and other Salesforce authentication credentials from AI chat requests; keep Salesforce tool execution inside the extension.
- [ ] Reverify the complete live backend payload, logging, Firestore retention, and OpenAI transport boundaries before releasing Dina Agent.

## Final publish checks

- [ ] Review the production pages at `https://dina.jp/` after deployment.
- [ ] Check every page in both light and dark themes after deployment, including the Common Tools workbench.
- [ ] Confirm the Chrome Web Store item ID still resolves after its listing metadata is updated.
- [x] Confirm EN/JP preference persistence across homepage, app pages, tools, and manuals in local headless Chrome.
- [x] Confirm all local links, image references, and redirects resolve in the release worktree.
- [ ] Confirm no organization IDs, usernames, email addresses, hosts, record IDs, or customer data appear in screenshots.

## Known content warning

The English manual currently includes 10 new screenshots that do not yet have
Japanese counterparts. The Japanese manual remains complete as text and only
renders screenshots that exist, but JP screenshot parity should be completed in
the extension capture environment before treating the manuals as fully matched.
The July 18 capture attempt was blocked because the local Salesforce CLI had no
valid authorization for the required `dinalab` org alias; reauthorize that alias
before rerunning the JP capture test.

## Policy references

- Chrome Web Store Program Policies: <https://developer.chrome.com/docs/webstore/program-policies/policies>
- Chrome Web Store Privacy Policies: <https://developer.chrome.com/docs/webstore/program-policies/privacy>
- Chrome Web Store Limited Use: <https://developer.chrome.com/docs/webstore/program-policies/limited-use>
- Chrome Web Store Listing Requirements: <https://developer.chrome.com/docs/webstore/program-policies/listing-requirements>
- Salesforce Trademark and Copyright Usage Guidelines: <https://www.salesforce.com/company/legal/intellectual-property/>
- OpenAI brand guidelines: <https://openai.com/brand/>
