# Website release checklist

Prepared: July 31, 2026

## Release scope

- DinaLab homepage
- Admin Toolkit for Salesforce product page, privacy policy, and EN/JP manual
- DinaSheet for Salesforce release-candidate page and privacy policy
- Dina Agent for Salesforce product page and privacy policy
- Common Tools
- Legacy URL redirects

## Completed in this release

- [x] Replace the Admin Toolkit and Dina Agent raster logos with the current vector marks from `dina-app`, and drop the duplicate `assets/salesforce-agentic-bot-icon.jpg` reference.
- [x] Add an "In the workshop" section to the homepage listing eleven earlier-stage apps with logo, platform, one line, and status.
- [ ] Confirm the new homepage copy reads correctly in Japanese; the marketing strings are newly written, unlike the manual translations. The four iOS app descriptions are the newest and have had the least review.
- [ ] Confirm each workshop status is still accurate at publish time: DinaDevOps beta 0.1.0, Dina Dock in development 0.1.0, Salesforce Prompter in development, Force Connect Voice prototype, Dina Bot early build, DinaSheet for Google Sheets in development, Dina Bloom early build 0.1.0, Dina in development 0.3.0, Dina 3D / Dina Draw / Dina Snap early build 0.1.0.
- [x] Decide whether the four consumer iOS apps (Dina tutor, Dina 3D, Dina Draw, Dina Snap) should appear on dina.jp or stay off a Salesforce-focused site. Decided: all four are listed in the workshop.
- [ ] Confirm Admin Toolkit 0.9.0 and Dina Agent 0.4.0 store status before publish. `dina-app` manifests are at those versions, but the homepage still frames Admin Toolkit as "Next release · 0.9.0" and Dina Agent as "In development" with no version.
- [x] Move every page onto one design system (`assets/dinalab.css`), replacing the three divergent palettes previously inlined per page.
- [x] Add a light/dark theme with a nav toggle, a shared preference key, and no flash of the wrong theme on navigation.
- [x] Apply the Japanese font stack site-wide; previously only the homepage and DinaSheet pages carried CJK fallbacks.
- [x] Rebuild the homepage around sharing knowledge, tools, and ideas, and retire the demo and style-guide pages into `index.html` and `assets/dinalab.css`.
- [x] Update Admin Toolkit public content for v0.8.0, SheetD, and GitHub Metadata Sync.
- [x] Publish the DinaSheet v0.2.0 release-candidate page and privacy-policy URL.
- [x] Add DinaSheet to the homepage, sitemap, site validation, and not-found navigation.
- [x] Publish DinaSheet product pages and screenshot manuals in English and Japanese.
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

- [ ] Submit the DinaSheet v0.2.0 package, store icon, promotional tiles, and screenshots to the Chrome Web Store.
- [ ] Confirm the DinaSheet Store privacy declarations match its current permissions, local update receipts, and published privacy policy.
- [x] Keep the extension manifest and user-visible extension UI named `Admin Toolkit for Salesforce` in the extension source repository.
- [ ] Confirm the Chrome Web Store item remains named `Admin Toolkit for Salesforce` and update its description and screenshots for version 0.8.0.
- [ ] Confirm the Chrome Web Store privacy declarations exactly match the current extension behavior and the published privacy policy.
- [ ] Confirm the Store single-purpose statement describes one narrow focus area: Salesforce administration and development workflows.
- [ ] Verify the developer support email and privacy-policy URL in the Chrome Web Store dashboard.
- [x] Rename the draft assistant in its source repository to `Dina Agent for Salesforce` before any public submission.
- [x] Exclude Salesforce session IDs, instance URLs, and authentication credentials from AI chat requests at both the callers and shared transport; reject these fields at the chat backend.
- [ ] Review whether backend-assisted metadata index and file-search features should continue receiving Salesforce session credentials; remove or retain with explicit in-product disclosure before releasing the assistant.

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
