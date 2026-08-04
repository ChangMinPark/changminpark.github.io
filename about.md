# Chang Min Park — Personal Website Content

> **Source of truth for live site:** `index.html` (Jekyll)  
> **Public URL:** [https://changminpark.github.io/](https://changminpark.github.io/)  
> **Resume PDF:** [GitHub — resume.pdf](https://github.com/ChangMinPark/cv/blob/master/resume/resume.pdf)  
> **Markdown resume:** [resume.md](https://github.com/ChangMinPark/cv/blob/master/resume/resume.md)  
> **Last synced:** June 2026

---

## About

I'm a senior Android engineer and interested in:

- Scalable Mobile App Architecture
- Jetpack Compose
- End-to-End Image Security
- Task Automation
- UI Compatibility Testing
- Automated Software Analysis
- Other various challenges in mobile systems

**Links**

- [Resume (PDF)](https://github.com/ChangMinPark/cv/blob/master/resume/resume.pdf)
- [Resume (Markdown)](https://github.com/ChangMinPark/cv/blob/master/resume/resume.md)

---

## Experience

### Yahoo!

**Senior Software Engineer** (Feb 2023 – Present), Mail Client Platforms — Android

- Lead Jetpack Compose migration of Yahoo Mail's highest-traffic surfaces (message list, compose, attachment smart view)
- Drive performance, architecture, and monetization improvements; plan work and mentor engineers

#### Extended impact (for resume / interviews — not all on live site)

<details>
<summary>Yahoo Mail — Jetpack Compose migration details</summary>

**Compose screen** (Feb 2025 – Present)

- Lead migration of compose and attachment-picker from XML/WebView to Compose
- Delegate attachment picker (senior engineer), scheduled-send/reply-to (senior engineer)
- Replace WebView/JS text fields with Compose; cross-version draft compatibility

**Message list** (Nov 2023 – May 2025)

- Technical lead ~18 months; memoization and recomposition tuning (>95% reduction in unnecessary recompositions)
- Slot system for ads, nudges, onboarding
- Dynamic filters/subfilters; contextual empty states
- Monetization experiments: Taboola +19% revenue, GAM +8%, Search Ads +31% impressions; ~$10M+ annual run-rate uplift cited in impact review

**Attachment smart view** (Aug 2023 – Apr 2024)

- First list-type Compose migration; unified `MailSubFilterItem`
- Phased rollout 5% → 100%; lifecycle/ViewModel bug fixes

**Leadership**

- Mentor intern → full-time hire
- Code review, Compose/Material SDK upgrades, framework regression fixes

</details>

---

### Breeding — Startup in South Korea

**CTO / Founding member** (May 2020 – Jul 2021)

- The first non-face-to-face platform service that connects dog owners and trainers
- Designed an app service and a business model

---

### University at Buffalo — The State University of New York

**Research Assistant**

- Ph.D., RMS Lab (Aug 2018 – Jan 2023)
- Undergraduate, RMS Lab (May 2016 – Aug 2017)

**Teaching Assistant**

- CSE 486/586: Distributed Systems (Jan 2020 – May 2021)
- CSE 421/521: Operating Systems (Aug 2017 – May 2018)

---

## Education

### University at Buffalo — The State University of New York

**Ph.D. in Computer Science and Engineering** (Aug 2017 – Jan 2023)

- Advisor: [Prof. Steven Y. Ko](https://steveyko.github.io/)
- Co-advisor: [Prof. Karthik Dantu](https://cse.buffalo.edu/faculty/kdantu/)
- Focus: Systems Challenges in Mobile Computing

**B.S. in Computer Science** (Aug 2011 – May 2017)

- Magna Cum Laude
- Summer 2012: Study abroad, Yonsei University, South Korea
- Jun 2013 – Mar 2015: Military service, Republic of Korea

---

## Publications

1. **“System and method for distributed personalization via adapted individualized language models using localized data”** — `U.S. Patent App. 19/540,086` (2026) — [Project page](/on-device-hyper-personalization)  
   Kelvin Bui, Wally Ho, Reid Isaki, **Chang Min Park**, Nicholas Wilson

2. **“Recover as It is Designed to Be: Recovering from Compatibility Mobile App Crashes by Reusing User Flows”** — `Archived` (2024)  
   Donghwi Kim, Hyungjun Yoon, **Chang Min Park**, Sujin Han, Youngjin Kwon, Steven Y. Ko, Sung-Ju Lee

3. **“End-to-End Image Integrity through Crestone”** — `Archived` (2023)  
   **Chang Min Park**, Mohammad Omidvar Tehrani, Karthik Dantu, Steven Y. Ko

4. **“Providing Image Confidentiality and Integrity on Mobile Devices”** — `Dissertation` (2022)  
   **Chang Min Park**

5. **“Rushmore: Securely Displaying Static and Animated Images Using TrustZone”** — `MobiSys` (2021) — [Project page](/rushmore)  
   **Chang Min Park**, Donghwi Kim, Deepesh Veersen Sidhwani, Andrew Fuchs, Arnob Paul, Sung-Ju Lee, Karthik Dantu, Steven Y. Ko

6. **“Gesto: Mapping UI Events to Gestures and Voice”** — `EICS` / `PACM-HCI` (2019) — [Project page](/gesto) — **Best Paper Honorable Mention**  
   **Chang Min Park**, Taeyeon Ki, Ali Ben Ali, Nikhil Sunil Pawar, Karthik Dantu, Steven Y. Ko, Lukasz Ziarek

7. **“Mimic: UI Compatibility Testing System for Android Apps”** — `ICSE` (2019) — [Project page](/mimic)  
   Taeyeon Ki, **Chang Min Park**, Karthik Dantu, Steven Y. Ko, Lukasz Ziarek

8. **“Reptor: Enabling API Virtualization on Android for Platform Openness”** — `MobiSys` (2017) — [Project page](/reptor)  
   Taeyeon Ki, Alexander Simeonov, Bhavika Pravin Jain, **Chang Min Park**, Keshav Sharma, Karthik Dantu, Steven Y. Ko, Lukasz Ziarek

---

## Awards & Grants

- **Excellence Award with $80,000 Grant** — K-Startup (ChungChung) Contest, South Korea (Nov 2020)
- **Top Award** — Youth Startup Awards, Youth and Future Corporation, South Korea (Oct 2020)
- **Pre-Startup Package with $50,000 Grant** — Ministry of SMEs and Startups, South Korea (Sep 2020)
- **Second Place** — CSE Ph.D. Poster Competition, University at Buffalo (Dec 2019)
- **Best Paper Honorable Mention** — EICS (Jun 2019)
- **SEAS Dean's Fellowship** — University at Buffalo (2017)
- **CSE Undergraduate Award for Research** — University at Buffalo (May 2017)
- **Dean's List** — University at Buffalo (2012)

---

## Research project pages (on site)

| Project | Path |
|---------|------|
| On-Device Hyper-Personalization | `/on-device-hyper-personalization` |
| Rushmore | `/rushmore` |
| Gesto | `/gesto` |
| Mimic | `/mimic` |
| Reptor | `/reptor` |
| Breeding | `/breeding` |
| Mocket | `/mocket` |
| Immix GC | `/immix` |

---

## Sync notes (website vs resume)

| Topic | Website (`index.html`) | Resume (`resume.tex`) |
|-------|------------------------|------------------------|
| Yahoo bullets | 3 high-level bullets | Full Compose migration + metrics |
| Research roles | Listed under UB | Not repeated (publications cover research) |
| Dean's List | Yes | No (space) |
| Patent authors | Full author list | Title only |

When updating one, consider updating the other and `resume.md` / this file.

---

## Checklist

- [ ] Yahoo section on live site matches latest role and bullets
- [ ] Resume PDF link works on About page
- [ ] New publications/patents added to `index.html` and `resume.tex`
- [ ] Rebuild Jekyll site after HTML changes
