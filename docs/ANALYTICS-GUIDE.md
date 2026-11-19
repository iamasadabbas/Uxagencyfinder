# Analytics guide for UX Agency Finder

Your website is ready to work with **Umami Cloud**, a free and privacy-friendly analytics tool. Umami doesn't use cookies, so you don't need a cookie banner. Once it's connected, you'll see how many people visit, which industry lists they read, and which agencies they click through to.

Setup takes about 10 minutes and is a one-time job.

---

## Part 1: Create your free Umami account (5 minutes)

1. Go to **https://cloud.umami.is** and click **Sign up**.
2. Sign up with your email (or Google/GitHub) and confirm your email address.
3. If you're asked to choose a plan, pick **Hobby (Free)**. At the time of writing it includes 1 website, 100,000 events a month and 6 months of data history. Check umami.is/pricing for the current limits.

## Part 2: Add your website (2 minutes)

1. In the Umami dashboard, open **Settings → Websites** and click **+ Add website**.
2. Fill in:
   - **Name:** `UX Agency Finder`
   - **Domain:** `uxagencyfinder.com`
3. Click **Save**.
4. Click **Edit** (or the settings icon) next to the website, then open the **Tracking code** tab.
5. You'll see a code snippet like this:
   ```html
   <script defer src="https://cloud.umami.is/script.js" data-website-id="a1b2c3d4-1234-5678-9abc-def012345678"></script>
   ```
   Copy only the **Website ID**, the long code inside `data-website-id="..."`.

## Part 3: Connect it to the website (2 minutes)

You don't need to paste any code. The website already has the Umami code built in, and it switches on as soon as it has your Website ID.

1. Open the file **`src/data/site.json`** in the project.
2. Find this section:
   ```json
   "analytics": {
     "provider": "umami",
     "umamiWebsiteId": "",
   ```
3. Paste your Website ID between the quotes:
   ```json
     "umamiWebsiteId": "a1b2c3d4-1234-5678-9abc-def012345678",
   ```
4. Save the file, then rebuild and redeploy the site (`npm run build`, or push to your hosting if it deploys automatically).

> **Easier option:** ask Claude: *"Set the Umami website ID in site.json to `<your ID>`, then build the site."*

## Part 4: Check it's working (1 minute)

1. Open **https://uxagencyfinder.com** in your browser and click around a few pages.
2. In Umami, open your website and click **Realtime**. You should see yourself as a live visitor within a few seconds.

Tracking only counts visits on `uxagencyfinder.com`. Visits on a local preview (localhost) or a test domain are ignored, so your numbers stay clean.

---

## What you can see in the dashboard

### Overview (the main page)
| Metric | What it means |
| --- | --- |
| **Visitors** | Unique people who visited |
| **Visits** | Separate browsing sessions |
| **Views** | Total pages viewed |
| **Bounce rate** | Visitors who left after one page |
| **Visit duration** | Average time spent on the site |

Below that you'll find:
- **Pages:** your most-read pages. Look for `/agencies/...-ux/` to see which industries are most popular.
- **Referrers:** where visitors came from (Google, LinkedIn, other websites).
- **Countries, devices, browsers:** where people are and what they use.

Use the date picker (top right) to switch between today, the last 7 days, 30 days and so on.

### Events (clicks we track for you)
Open the **Events** tab to see these actions:

| Event name | What it tells you |
| --- | --- |
| `official_site_click` | Someone clicked through to an agency's website (your most valuable signal) |
| `evidence_click` | Someone opened an agency's case study |
| `search_select` | Someone used the search box to jump to an industry or agency |
| `directory_filter` | Someone filtered the directory by industry |
| `worksheet_copy` | Someone copied a worksheet from a hiring guide |
| `contact_compose` | Someone started an email from the contact page |

Click an event to see its details. For example, open `official_site_click` and look at the **agency** and **industry** properties to see **which agencies get the most clicks, and from which industry pages**.

> An outbound click shows interest. It isn't a confirmed lead or sale.

---

## Useful extras (optional)

- **Share a read-only link:** Website settings → **Share URL** → turn it on. Anyone with the link can view the stats without logging in, which is handy for partners or a weekly check.
- **Email reports:** if your plan offers scheduled reports, set up a weekly summary under the website's settings.
- **Google Search Console (also free):** shows which Google searches bring people to your site. Go to https://search.google.com/search-console, add `uxagencyfinder.com`, verify it (the DNS option is easiest), then go to **Sitemaps** and submit `https://uxagencyfinder.com/sitemap.xml`. Umami tells you what people do on the site, and Search Console tells you how they found it on Google.

## Turning analytics off

Clear the Website ID in `src/data/site.json` (`"umamiWebsiteId": ""`) and redeploy. The tracking script won't load at all.

## Questions

| Question | Answer |
| --- | --- |
| Do I need a cookie banner? | No. Umami doesn't use cookies or collect personal data. |
| Does it slow the site down? | No. The script is about 2 KB and loads after the page. |
| What if I go over the free limit? | Umami will ask you to upgrade. Each page view and each tracked click counts as an event. |
| Can I add teammates? | Team members may need a paid plan. On the free plan, use the Share URL instead. |

