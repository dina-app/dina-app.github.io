# Website release checklist

Prepared: July 18, 2026

## Release scope

- DinaLab homepage
- DinaLab Admin Toolkit product page, privacy policy, and EN/JP manual
- DinaLab Agent Assistant product page and privacy policy
- Common Tools
- Legacy URL redirects

## Completed in this release

- [x] Use DinaLab-owned product names instead of incorporating the Salesforce trademark into app names.
- [x] Use Salesforce only as a descriptive compatibility or workflow reference.
- [x] Add Salesforce trademark attribution and independence language to primary product surfaces.
- [x] Rename Google Cloud Functions copy to the current Cloud Run functions product name.
- [x] Replace personal/portfolio wording with consistent studio and business-facing language.
- [x] Keep privacy disclosures aligned with the described data flows.
- [x] Keep the Chrome Web Store Limited Use disclosure in both extension privacy policies.
- [x] Move stale legacy product and privacy pages to canonical redirects.
- [x] Make the EN/JP manual reproducible from its generator without losing the stored language preference.
- [x] Add canonical metadata to primary public pages.

## Required external actions before publishing the renamed product

- [x] Rename the extension manifest and user-visible extension UI to `DinaLab Admin Toolkit` in the extension source repository.
- [ ] Rename the Chrome Web Store item to `DinaLab Admin Toolkit` and update its description, screenshots, and promotional images so they match this site. The extension source manifest and UI now use the release name.
- [ ] Confirm the Chrome Web Store privacy declarations exactly match the current extension behavior and the published privacy policy.
- [ ] Confirm the Store single-purpose statement describes one narrow focus area: Salesforce administration and development workflows.
- [ ] Verify the developer support email and privacy-policy URL in the Chrome Web Store dashboard. The public site now provides a direct GitHub Issues support route.
- [x] Rename the draft assistant in its source repository to `DinaLab Agent Assistant` before any public submission.
- [x] Exclude Salesforce session IDs, instance URLs, and authentication credentials from AI chat requests at both the callers and shared transport; reject these fields at the chat backend.
- [ ] Review whether backend-assisted metadata index and file-search features should continue receiving Salesforce session credentials; remove or retain with explicit in-product disclosure before releasing the assistant.

## Final publish checks

- [ ] Review the production pages at `https://dina.jp/` after deployment.
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
