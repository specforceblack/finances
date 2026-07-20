# Finances

A personal monthly finance tracker: **Actuals** (what actually happened this month)
and **Forecast** (a rolling 12-month projection, plus a house-affordability
calculator), sharing the same categories and charts.

Static Angular app — no backend, no database. All data is stored in your
browser's `localStorage`, per device. Nothing is sent anywhere.

## Local development

```bash
npm install
npm start        # http://localhost:4200
```

## Build

```bash
npm run build     # -> dist/browser
```

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds and publishes `dist/browser` on every
push to `main`, using the repo name as the base href (so it works at
`https://<you>.github.io/<repo>/`). One-time setup in the GitHub repo:

**Settings → Pages → Build and deployment → Source: "GitHub Actions"**.

Routing uses the hash strategy (`/#/forecast`, etc.) specifically so it works
on GitHub Pages without any server-side rewrite rules.

You can also deploy manually without CI:

```bash
npm run build
npx angular-cli-ghpages --dir=dist/browser
```

## Data: no server, so no sync between devices

Because there's no database, entries you make on your phone won't
automatically appear on your desktop (or vice versa) — each browser has its
own local copy. Use **Settings → Export backup** to download a JSON snapshot
and **Import backup** on the other device to bring it up to date. There's no
merge — importing replaces the current data on that device.

## PIN lock

Settings lets you set a PIN, which blanks the screen until it's entered. This
is a light deterrent for a public URL, not real security: the check runs
entirely in the browser, and anyone with local access to the device (or who
knows to clear site data) can bypass it. Don't rely on it to protect data you
consider truly sensitive — the underlying protection is that the data never
leaves your device in the first place.

## Affordability estimate

The house affordability panel on the Forecast page (deposit shortfall,
months-to-target, estimated monthly mortgage payment) is a rough planning
calculation using a standard repayment formula — it doesn't account for fees,
insurance, or rate changes, and isn't financial advice.
