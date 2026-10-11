# Mafaza Networks redesign

Responsive, static six-page redesign prepared by OakBuilds for client review. Includes Home, About Us, Consulting, Solutions, Virtualizations / VoIP, and Contact. The existing mafazanetwork.com website and DNS are not changed by this repository.

## Deploy on AWS Amplify

1. In Amplify Hosting, create an app and connect the GitHub repository `OakBuilds/mafaza`.
2. Select branch `main`. Amplify reads the included `amplify.yml`.
3. Deploy. The output directory is `dist`; no environment variables, database, CMS, or server runtime are required.
4. Open the generated Amplify URL and verify all six pages before sharing it.
5. For the temporary domain, add `aitdevops.com` through Amplify Domain management and follow its DNS validation instructions. Inspect existing DNS and hosting before assigning the root domain; `mafaza.aitdevops.com` can host this review without replacing an existing root site.

This is a multi-page static site. Do not add a blanket single-page-app rewrite sending every request to index.html. Main links use explicit .html paths. The optional directory-shaped legacy aliases have their own index.html redirects.

The review keeps noindex/nofollow and robots exclusions. These are indexing preferences, not authentication: an ordinary Amplify deployment is accessible to people with its URL unless hosting access control is enabled. The separate Sites review remains private.

## Editing and checks

Run `python3 build.py`, `python3 validate.py`, and `node test-interactions.cjs` before committing edits. Page templates live in build.py; shared CSS and JavaScript live in dist/assets. dist is tracked and includes locally hosted fonts and optimized WebP images.

Static validation and JavaScript interaction checks pass. Rendered browser/device validation is still pending.

## Content and branding

The user-supplied original homepage and legacy images informed the redesign. Unrelated gambling content from the old HTML was excluded. The refreshed wordmark preserves the antenna concept. AI-generated service imagery is illustrative; people and facilities are not presented as Mafaza staff or premises. Confirm office locations, revised copy, services, and proposed branding with the client before their production launch.

The inquiry form validates required fields and prepares an editable email draft. It does not submit or send anything automatically and stores no form data. Sending uses the visitor's own email app.

Font: Rubik, SIL Open Font License; see dist/assets/OFL-Rubik.txt.
