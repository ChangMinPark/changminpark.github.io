---
title: "Semantic vs Atomic CSS: Name the Thing or Name the Look"
excerpt: "A redesign that breaks forty pages, or markup nobody can read. Semantic vs utility CSS is a maintenance failure mode — not a religion."
date: 2024-09-18 13:00:00
tags: [Writing, DevEx]
draft: false
---

<details class="post-prereq" markdown="0">
  <summary>Prerequisites</summary>
  <div class="post-prereq__body">
    <p class="post-prereq__hint">Read these first if <strong>utility-first CSS</strong>, <strong>semantic class names</strong>, or <strong>the cascade</strong> are new.</p>
    <ul>
      <li><a href="https://tailwindcss.com/docs/utility-first">Tailwind — Utility-first fundamentals</a> — atomic classes; one of the two naming strategies in this post</li>
      <li><a href="https://getbem.com/introduction/">BEM</a> — a common semantic naming method (name the thing, not the look)</li>
      <li><a href="https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Getting_started">MDN — CSS basics</a> — selectors and cascading</li>
      <li><a href="https://bradfrost.com/blog/post/atomic-web-design/">Brad Frost — Atomic Design</a> — component hierarchy; <em>not</em> the same as atomic CSS</li>
    </ul>
  </div>
</details>

## Two failure modes, one “CSS strategy” meeting

**Failure A.** You rename `.btn--primary` for a brand refresh and forty templates shift — including three that only *looked* like primary buttons. Semantic names drifted into “whatever we pasted last year.”

**Failure B.** Every screen is a twenty-class utility string. A theme tweak means hunting duplicates; reviews cannot see intent; copy-paste diverges by one `px` and nobody notices until dark mode.

**Semantic CSS** asks *what is this?* **Atomic / utility-first CSS** asks *how does it look?* They are not [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/) (atoms → organisms). That is component hierarchy. This post is about the maintenance fights those two naming strategies create — and the hybrid that usually ships.

## Same control, two ways to get hurt

Semantic call site:

```html
<button class="btn btn--primary" type="button">Save</button>
```

```css
.btn {
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
}
.btn--primary {
  background: #2563eb;
  color: #fff;
  border: none;
}
```

Utility-first call site (Tailwind-shaped):

```html
<button
  type="button"
  class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
>
  Save
</button>
```

| Pain | Semantic gone wrong | Atomic gone wrong |
|------|---------------------|-------------------|
| Change the look of “primary” | Easy in one rule — until the class meant three different things | Hunt every utility string or extract a component late |
| Read a PR for intent | Clear if names stayed honest | Noisy; reviewers guess from pixels |
| Dead CSS | Classes accumulate forever | Lower if purge works; higher if you fork utilities by hand |
| Content / docs sites | Stable role names (`.post-prereq`) age well | Utility soup fights long-lived HTML in markdown |

## The incident that settles the argument

A product UI ships fast in utilities. Six months later, “make primary buttons match the new brand” touches dozens of files — or worse, half of them. Someone extracts `.btn--primary` that `@apply`s the utilities. Call sites go quiet again. That is not a conversion ceremony; it is admitting **the boundary needs a name**.

```html
<!-- Call site stays readable -->
<button class="btn btn--primary" type="button">Save</button>
```

```css
.btn--primary {
  @apply inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white;
}
```

Or wrap the utility string in a small design-system component so product screens never paste twenty classes. Most “Tailwind shops” that stay sane land here. Content sites (including a personal Writing blog) keep semantic shells like `.post-prereq` and put tokens/utilities *inside* the component stylesheet:

```html
<details class="post-prereq">
  <summary>Prerequisites</summary>
  <!-- body -->
</details>
```

Prefer the semantic name at the boundary humans and articles read; name the look inside the implementation.

> **Rule of thumb** - name the thing at the boundary users and teammates read; name the look inside the implementation. Design tokens matter more than picking a religion.

Utility-first won a lot of product UI in the 2020s. Semantic never left content and stable component APIs. The interesting problem is not “which is popular?” — it is which failure mode you are currently in, and whether the fix is a rename, a purge, or a hybrid boundary.

## References

- [Adam Wathan — CSS Utility Classes and “Separation of Concerns”](https://adamwathan.me/css-utility-classes-and-separation-of-concerns/) — why utilities fight the old “semantic class = component” rule
- [MDN — Introducing the CSS cascade](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Introduction) — specificity and source order when both naming styles share a stylesheet
- [CUBE CSS](https://cube.fyi/) — composition layer that keeps semantic shells and utility internals from collapsing into one soup
- [CSS Guidelines (Harry Roberts)](https://cssguidelin.es/) — long-lived CSS architecture for sites that outlive a redesign
