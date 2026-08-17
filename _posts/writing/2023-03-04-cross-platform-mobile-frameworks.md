---
title: "Cross-Platform Mobile Frameworks: Flutter, RN, and the WebView Trap"
excerpt: "Write-once hides a fork: WebView vs native widgets. Flutter, RN, and when the WebView trap shows up."
date: 2023-03-04 13:20:00
tags: [Writing, Android]
draft: false
---

<details class="post-prereq" markdown="0">
  <summary>Prerequisites</summary>
  <div class="post-prereq__body">
    <p class="post-prereq__hint">Read these first if <strong>React Native bridge, Flutter rendering, WebView hybrids, or MAUI</strong> are new.</p>
    <ul>
      <li><a href="https://reactnative.dev/architecture/overview">React Native — Architecture overview</a> — JS ↔ native bridge / New Architecture</li>
      <li><a href="https://docs.flutter.dev/resources/architectural-overview">Flutter architectural overview</a> — Dart, engine, Skia/Impeller</li>
      <li><a href="https://developer.android.com/develop/ui/views/layout/webapps/webview">WebView on Android</a> — embedding web UI in an app</li>
      <li><a href="https://learn.microsoft.com/en-us/dotnet/maui/what-is-maui">.NET MAUI</a> — single-project cross-platform UI model</li>
    </ul>
  </div>
</details>

## One codebase — two very different architectures

"Cross-platform" usually means "write once, run on iOS and Android." That promise hides a fork: does your UI run in a **WebView**, or does JavaScript/Dart/C# call into **native widgets** (or draw its own)? Teams that miss this distinction budget for React Native and ship something closer to Cordova — then wonder why scroll and keyboard feel wrong.

In 2022 the question for small teams was cost and reuse across Flutter, Xamarin, React Native, and Titanium. The comparison still holds on *intent*; the market moved on *status*. Xamarin became [.NET MAUI](https://learn.microsoft.com/en-us/dotnet/maui/what-is-maui); Appcelerator Titanium is effectively legacy. Flutter and React Native absorbed most greenfield cross-platform work. What has not changed is the hybrid-vs-native-bridge confusion — still the most common misunderstanding in mobile architecture threads.

## The comparison table

<img src="{{ site.baseurl }}/images/posts/cross-platform-mobile-frameworks/framework-comparison-table.png" alt="Comparison table of Flutter, Xamarin, React Native, and Titanium cross-platform frameworks" width="100%" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 1. Language, UI model, and platform linkage for four cross-platform options (2022 snapshot).*

### Flutter (Google, Dart)

Renders its own widget tree via Skia/Impeller — **no platform UI components by default**. UIs look identical on iOS and Android, which helps design systems and reduces "why does this look different on Pixel?" bugs.

Tradeoff: platform-specific polish (SF Symbols quirks, Material motion on older Android) takes extra work. Plugins that wrap native SDKs often require platform-specific code that **does not** share across iOS and Android.

### React Native (Meta, JavaScript/TypeScript)

Maps React components to **native views** through the bridge (and increasingly the New Architecture's JSI). Feels closer to platform defaults; accessibility and text often inherit OS behavior for free.

Tradeoff: bridge overhead and layout surprises on complex lists; heavy reliance on npm means you inherit native module quality from the community.

### Xamarin / .NET MAUI (Microsoft, C#)

Xamarin.Forms mapped C# to native controls — similar linkage model to React Native. Microsoft has consolidated the story into **.NET MAUI**; new enterprise Microsoft shops should start there, not greenfield Xamarin. Strength: deep .NET ecosystem and enterprise tooling; weakness: smaller mobile-native hiring pool than JS or Dart.

### Titanium (Appcelerator, JavaScript)

Also bridged JS to native APIs **without WebView**, popular in enterprise a decade ago. Maintenance and community have shrunk; treat it as a historical reference when reading older comparisons, not a 2026 default.

## Third-party libraries — where "shared code" stops

Class-library-heavy apps (maps, payments, analytics, ML) hit the same wall on every bridge framework: the **shared layer ends at the plugin boundary**. Flutter's federated plugins and React Native's native modules both push you to write Swift/Kotlin for anything non-trivial. Flutter's table in Figure 1 is optimistic about reuse; in production, plan for platform folders.

Symptom: the demo compiles in a week; the payment SDK integration takes a month per platform.

## Hybrid WebView is not cross-platform native-bridge

This is the confusion worth a whole section:

| | React Native / Titanium / Flutter (mostly) | Ionic / Cordova / PhoneGap |
|--|---------------------------------------------|----------------------------|
| UI runtime | Native views or custom engine | HTML/CSS/JS in WebView |
| Scroll/lists | Platform or engine recycling | Browser layout |
| Typical pain | Bridge, plugin gaps | Scroll jank, keyboard, memory |

All may use JavaScript. Only the second column is a **hybrid app** in the sense of [Types of Mobile Apps]({{ site.baseurl }}/types-of-mobile-apps). Marketing pages that lump "JavaScript mobile" together cause teams to pick the wrong tool.

```text
User tap
   │
   ├─ RN/Titanium ──► JS bundle ──► native view tree
   │
   └─ Ionic/Cordova ──► JS ──► WebView ──► browser layout engine
```

## How to choose (2026-aware)

| Team / product | Reasonable first pick |
|----------------|----------------------|
| Strong web/React, startup speed | React Native |
| Custom UI, design-system control | Flutter |
| Microsoft stack, enterprise LOB | .NET MAUI |
| Web app already shipped, thin native shell | Ionic/Capacitor (know the WebView ceiling) |
| List-heavy, ads, platform text fields | Native Compose/SwiftUI (cross-platform may fight you) |

## Related reading

- **Internal:** [Types of Mobile Apps]({{ site.baseurl }}/types-of-mobile-apps)
- **Docs:** [Flutter — platform channels](https://docs.flutter.dev/platform-integration/platform-channels); [React Native — New Architecture](https://reactnative.dev/docs/the-new-architecture/landing-page)
- **Articles surveyed:** Impact Tech Lab [Flutter vs React Native vs Xamarin](https://impacttechlab.com/flutter-react-native-xamarin-a-cross-platform-comparison/) — useful feature matrix, notes Xamarin deprecation; Tempest House on [Titanium vs RN vs Ionic](https://www.tempest.house/blog-posts/pros-and-cons-xamarin-vs-react-native-vs-ionic-vs-flutter-vs-phonegap-vs-appcelerator-titanium-which-one-is-right-for-you) — good for the WebView vs bridge distinction.

## References

- [Flutter — Platform channels](https://docs.flutter.dev/platform-integration/platform-channels)
- [React Native — New Architecture](https://reactnative.dev/docs/the-new-architecture/landing-page)
- [.NET MAUI — What is MAUI?](https://learn.microsoft.com/en-us/dotnet/maui/what-is-maui)
- [Impact Tech Lab — Flutter vs React Native vs Xamarin](https://impacttechlab.com/flutter-react-native-xamarin-a-cross-platform-comparison/)
- [Tempest House — Xamarin vs RN vs Ionic vs Flutter vs PhoneGap vs Titanium](https://www.tempest.house/blog-posts/pros-and-cons-xamarin-vs-react-native-vs-ionic-vs-flutter-vs-phonegap-vs-appcelerator-titanium-which-one-is-right-for-you)
