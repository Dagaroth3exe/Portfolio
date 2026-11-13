# Content notes: what needs your input

All copy lives in `app/lib/content.ts`. Every fact on the site comes from the previous
version of the portfolio. Nothing was invented. The items below are gaps or inferences
that need your confirmation or your material.

## Needs your input

| # | Item | Where | Why |
|---|------|-------|-----|
| 1 | **Real project visuals** (screenshots, screen recordings, device mockups) | `app/components/ui/ProjectCover.tsx` | The covers are abstract generative art, not screenshots. Real captures will do more for each case study. |
| 2 | **Live URLs** for Orchestrix, EarthFirst, Leftover Logic | `projects[].live` in `content.ts` | The old site linked to `#`. The "Live build" button only appears when a URL is set. |
| 3 | **Project years and your role** on each project | `projects[]` | Not in the old site, so case studies don't show them. |
| 4 | **Outcomes and metrics** (users, performance, results) | Case-study pages | The new case-study format has room for an Outcome section. Not added, because no verified numbers exist. |
| 5 | **Which AI API** Leftover Logic uses | `projects[2]` | The old site only said "integrated AI API". |
| 6 | **Concrete automation examples** (n8n / Make workflows you've shipped) | `lab.ai` | Described generally. One or two named examples would make it stronger. |
| 7 | **Motion design / 3D work**, if you have any | New project entries | The brief describes a motion/3D artist, but the verified portfolio is frontend + AI automation. Expertise is framed around verified skills only. Add any motion/3D projects and they'll slot into the gallery. |
| 8 | **Personal domain** | `metadataBase` in `app/layout.tsx` | Currently points to your GitHub. Set this to the deployed URL so Open Graph links resolve. |
| 9 | **OG / social share image** | `app/opengraph-image.*` | None yet. A render of the 3D emblem would work well. |

## Inferences to confirm

- **First Feather ↔ EarthFirst.** The two descriptions overlap (tree-planting, Tree Buddy, leaderboards), but the site does not claim they are the same project. Confirm, and I can link them.
- **Interests and process copy** (About → "Off the clock", the five-stage process). These are written from your stated interests (F1, AI automation, pit-stop precision) and stack. Check that the voice and claims feel accurate.
- **"Interface Craft & Motion"** discipline. This is based on Figma, Framer Motion, Material UI and Styled Components from your skills list.
- **Stats.** "2+ years shipping", "03 shipped builds" and "15+ tools" are carried over from the old hero.

## Brand mark

The "3" emblem is an **original geometry** (`app/lib/logo.ts`): an italic angular 3 with
aero chamfers and a chevron middle arm. The reference image you
supplied is Max Verstappen's trademarked number logo (© Verstappen.com). Copying it exactly
would make a personal brand that infringes on a real driver's identity, so the emblem keeps
its spirit (slanted, blocky, racing) without tracing it. Edit the points in `logo.ts` and
the 3D model, nav mark, favicon, intro and transitions all update together.

## New copy to review (thesis, outcomes, Q&A)

Written from facts already on the site. Please check the wording:

- **Thesis** (`thesis` in `content.ts`): the "screen and the system behind it" through-line, and the three
  captioned stats (3 roles since 2024, 3 projects, 3 voice-pipeline languages).
- **Project outcome lines and Was → Became rows** (`projects[].outcome / was / became`): derived from each
  project's summary. No metrics, because none are verified. Add real numbers here once you have them.
- **Q&A answers** (`faq`): plain-language versions of the experience, skills and contact copy.
- **"How it starts"** (`contact.howItStarts`) promises a reply with questions and a plan. Edit it if that's not how you work.
- **Signals**: GitHub repos, last push and followers are fetched live in the visitor's browser. If the
  GitHub API fails or is rate-limited, they read "not checked" instead of showing a number.

## VaultAI (featured project)

- **Permission to share.** VaultAI is internal DJT work. The case study names the company and quotes figures
  (99% accuracy, 574 tests, 693/693 load test, DGX Spark). Confirm with your manager that this is OK to publish.
  If not, change `context` and the figures in `projects[0]` to something general, such as "an enterprise document vault".
- **AI-assisted development.** Your notes suggested saying that much of the code was written with an AI coding
  assistant (Claude Code). The page doesn't say this yet. Add a line to `summary` or `build` if you want to state it.
- **Visuals.** The cover is generated artwork. Screenshots of the orb UI or the confirmation cards would make it stronger.
