---
title: "Types of Mobile Apps: When Native Still Wins"
excerpt: "Native, web, PWA, hybrid — pick by symptoms, not labels. When frame time and device APIs still force native."
date: 2025-07-03 12:00:00
tags: [Writing, Android]
draft: false
---

<details class="post-prereq" markdown="0">
  <summary>Prerequisites</summary>
  <div class="post-prereq__body">
    <p class="post-prereq__hint">Read these first if <strong>WebView hybrids</strong>, <strong>PWAs</strong>, or <strong>native SDKs</strong> are new.</p>
    <ul>
      <li><a href="https://developer.android.com/develop/ui/views/layout/webapps">Web apps and WebView</a> — embedding a browser engine inside an APK (the trap this post warns about)</li>
      <li><a href="https://web.dev/explore/progressive-web-apps">Progressive Web Apps (web.dev)</a> — installable web apps vs store binaries</li>
      <li><a href="https://developer.android.com/guide/components/fundamentals">App fundamentals</a> — what “native” means: components and platform APIs, not a tab</li>
      <li><a href="{{ site.baseurl }}/cross-platform-mobile-frameworks">Cross-platform mobile frameworks</a> — Flutter/RN as a third option beside native and web</li>
    </ul>
  </div>
</details>

## The decision that keeps coming back

Every mobile project eventually hits the same fork: ship a browser tab, wrap the website, or commit to platform-native code. The labels — native, web, PWA, hybrid — sound like a textbook taxonomy. In practice the choice shows up as symptoms: scroll jank on a long feed, a camera API that works on Android but not iOS Safari, or a surface where WebView already failed a performance budget.

I have hit this fork more than once. At Breeding (2020–2021), a dog-trainer marketplace, we chose native Android early because push, camera uploads, and session reliability were core to the product. The same question shows up at much larger scale in consumer apps — for example, in a mail app: when does a high-traffic surface justify Kotlin and Jetpack Compose instead of stacking more WebView?

This post is a decision map written after both, not a claim that the Breeding years were Mail work.

## Four buckets — and what actually differs

<img src="{{ site.baseurl }}/images/posts/types-of-mobile-apps/app-types-diagram.png" alt="Diagram comparing native, web, PWA, and hybrid mobile app architectures" width="100%" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 1. Native, web, PWA, and hybrid — where code runs and what wraps it.*

### Native apps

Built with platform SDKs (Swift/SwiftUI on iOS, Kotlin/Jetpack Compose on Android). The binary talks to the OS directly.

**Pros:** Best input-to-render latency for gesture-heavy UI; full device APIs (Bluetooth, biometrics, background work); platform-native feel.

**Cons:** Separate codebases per platform; higher build and QA cost; two release trains unless you add a cross-platform layer on top.

**When teams still pick native:** Hardware-adjacent features, strict offline/sync, or UI where frame time is the product — long heterogeneous feeds, rich-text editors, media previews. In a mail-style Android client, that is why the highest-traffic surfaces often move toward Compose rather than stacking more WebView on critical paths.

### Web apps

HTML, CSS, and JavaScript in a mobile browser. No app store install.

**Pros:** Cheapest to ship and iterate; one codebase; instant updates; great when traffic arrives from search or shared links.

**Cons:** Browser sandbox limits sensors and background work; push and offline are improving but still uneven on iOS; complex interactions often feel "almost native" but miss on fling physics and keyboard behavior.

### Progressive web apps (PWAs)

Web apps plus service workers, install prompts, and (on supported platforms) push and offline caches.

**Pros:** App-like retention mechanics without store friction; strong for content and form-heavy flows.

**Cons:** Still bounded by browser capabilities; install prompts are easy to ignore; enterprise MDM and store discovery differ from a Play/App Store listing.

### Hybrid apps (WebView shell)

Web UI rendered inside a native container (Cordova, Ionic, Capacitor). Native code provides the shell, store listing, and bridge APIs.

**Pros:** Reuse web skills; faster than dual native for simple CRUD; store distribution with partial device access.

**Cons:** Performance ceiling is the WebView; gesture and scroll bugs are common on long pages; debugging spans JS and native layers.

> **Rule of thumb** - if the hardest part of your product is *scroll performance on a heterogeneous feed*, a WebView hybrid is already fighting uphill.

## How this connects to cross-platform frameworks

Native is not the same as "no sharing." Flutter, React Native, and .NET MAUI share business logic and often UI, but they are not WebView hybrids — they compile or bridge to platform views (or draw their own, in Flutter's case). Ionic and Cordova *are* WebView hybrids. Conflating the two leads to bad estimates: "we use JavaScript" does not tell you whether you inherit browser layout or native list recycling.

See [Cross-Platform Mobile Frameworks]({{ site.baseurl }}/cross-platform-mobile-frameworks) for that split in detail.

## A practical decision table

| Symptom / requirement | Lean toward |
|------------------------|-------------|
| SEO, link sharing, low install friction | Web or PWA |
| Complex gestures, 60fps lists, rich text | Native (Compose / SwiftUI) |
| Existing web team, simple forms, MVP | PWA or hybrid shell |
| BLE, AR, custom camera pipeline | Native |
| One mobile team, custom UI, not WebView | Flutter or React Native |

## Related reading

- **Docs:** [Android app fundamentals](https://developer.android.com/guide/components/fundamentals); [What makes a good PWA](https://web.dev/articles/pwa-checklist)
- **Articles surveyed:** Koder.ai on [PWA vs Flutter vs native Compose/SwiftUI tradeoffs](https://koder.ai/blog/pwa-vs-flutter-vs-native-swiftui-compose-key-differences) — strong on offline and hardware boundaries; James Ross Jr. on [enterprise native vs hybrid vs PWA](https://www.jamesrossjr.com/blog/enterprise-mobile-development) — good cost framing for B2B.

## Wrap-up

Labels matter less than *where your bottleneck lives*. Browser distribution wins reach; native wins when latency, device APIs, or scroll architecture are on the critical path. Start from the failure mode you cannot afford (slow lists, missing push, store-only monetization), then pick the bucket that fixes that first constraint.

## References

- [Android Developers — App fundamentals](https://developer.android.com/guide/components/fundamentals)
- [web.dev — PWA checklist](https://web.dev/articles/pwa-checklist)
- [Koder.ai — PWA vs Flutter vs native (Compose/SwiftUI)](https://koder.ai/blog/pwa-vs-flutter-vs-native-swiftui-compose-key-differences)
- [James Ross Jr. — Enterprise mobile: native, hybrid, or PWA](https://www.jamesrossjr.com/blog/enterprise-mobile-development)
