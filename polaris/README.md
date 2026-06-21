# Polaris — Parent Platform

> Building the world's first evidence-based child development companion.

Polaris helps families **understand, develop and celebrate** every child's unique
potential — not through tests, scores or rankings, but through everyday
observations, meaningful experiences and reflection.

This folder is a working, self-contained prototype of the **Polaris Parent
Platform** (the Phase-1 MVP described in the Polaris Product Bible). It runs
entirely in the browser — no build step, no backend — and faithfully implements
the Polaris philosophy and intelligence model from the source books.

## Quick start

Just open `polaris/index.html` in a browser, or serve the folder:

```bash
cd polaris
python3 -m http.server 8080
# then visit http://localhost:8080
```

On first launch you'll be guided through a calm onboarding ("Discover your
child"), or you can tap **"Explore with sample child"** to load a rich demo
profile (meet *Aanya*, age 9) and see the whole platform populated immediately.

## What it implements (mapped to the Polaris books)

| Polaris concept | Where it lives |
| --- | --- |
| **Development Standard** — 10 Pillars → Competencies → Behaviors → Growth Stages (Books 4 & 6) | `js/framework.js` |
| **Experience Library + Discovery** — purpose-built experiences with evidence & reflection prompts (Books 5 & 9) | `js/experiences.js` |
| **Knowledge Graph + Confidence Model** — evidence-driven competency states, never numeric to the user (Books 3 & 7) | `js/engine.js` |
| **Recommendation Engine** — explainable Next-Best-Experience (Need → Evidence → Confidence → Personalization → Prioritization) (Books 8 & 12) | `js/engine.js` |
| **AI Coach** — deterministic, evidence-anchored, never labels or compares (Book 12) | `js/coach.js` |
| **Design System** — calm, warm, North-Star inspired; no red alerts, no rankings (Book 14) | `css/polaris.css` |
| **Parent Platform IA & product language** (Books 1 & 9) | `js/app.js` |

## The Growth Loop in action

The platform turns the Polaris Growth Loop into real software:

```
Observe → Understand → Recommend → Experience → Reflect → Grow → (repeat)
```

- **Observe** — capture everyday behaviours (multi-observer, multi-context).
- **Understand** — the engine builds *confidence* per competency from the
  quantity, diversity, recency and consistency of evidence. Confidence grows
  gradually and is shown as growth stages (Emerging → Inspiring Others).
- **Recommend** — the **Next Adventures** view suggests experiences and explains
  *exactly why*: what was observed, why now, what it strengthens, expected
  outcome — fully reproducible from the graph.
- **Experience & Reflect** — start an adventure, then complete it with a
  reflection and evidence. Each completion feeds new evidence back into the graph.
- **Grow** — every new piece of evidence can create a **Child Growth Moment**,
  the platform's true success metric.

## Key screens

- **Growth Journey** (Home) — today's Next Adventure, weekly snapshot, development snapshot.
- **Development** — the *Development Constellation* (10-pillar radar) and *Competency Garden*.
- **Next Adventures** — explainable recommendations.
- **Adventures** — the full, filterable experience library.
- **Discovery** — quick observation capture + Atlas-based prompts.
- **Growth Timeline** — the child's unfolding developmental story.
- **Portfolio** — photos, projects and proud moments.
- **Growth Story** — an encouraging, plain-language report.
- **AI Coach** — ask about strengths, plans, or *why* something is recommended.

## Design principles honoured

- We **guide, never label**. We **observe, never judge**.
- The only comparison is *Child Today vs. Child Yesterday*.
- Every insight is backed by **evidence**; nothing is fabricated.
- Language is warm: *Discovery Journey*, *Next Adventure*, *Growth Story*,
  *Growth Opportunity* (never "test", "report", "weakness").

## Data & privacy

All data lives **only in your browser's `localStorage`**. Nothing is sent
anywhere. You can export your data as JSON, reload the sample child, or start
fresh from **Profile & Settings**.

## Architecture notes

Plain HTML/CSS/JS with a small global `window.Polaris` namespace and ordered
`<script>` tags (no bundler, works from `file://` or any static host). The
layers are intentionally separated so the "intelligence" can be lifted into a
real backend later, exactly as the Engineering Handbook (Book 15) envisions:

```
framework.js  → Development Layer (the Standard/Atlas content)
experiences.js→ Experience Layer + Discovery
store.js      → graph instance data + persistence
engine.js     → reasoning: confidence, insights, recommendations, reports
coach.js      → explainable assistant
seed.js       → demo journey
app.js        → UI / Information Architecture
```
