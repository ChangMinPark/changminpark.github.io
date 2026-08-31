---
title: "Imperative vs Declarative Android UI: What Migration Actually Changes"
excerpt: "Compose does not fail like ListAdapter. What actually changes when UI becomes a function of state — and which bugs migrate with you."
date: 2026-02-06 12:00:00
tags: [Writing, Android]
draft: false
---

<details class="post-prereq" markdown="0">
  <summary>Prerequisites</summary>
  <div class="post-prereq__body">
    <p class="post-prereq__hint">Read these first if <strong>Compose as UI = f(state)</strong>, <strong>the View system</strong>, or <strong>recomposition</strong> are new.</p>
    <ul>
      <li><a href="https://developer.android.com/develop/ui/compose/mental-model">Compose mental model</a> — describe UI from state; the runtime reconciles</li>
      <li><a href="https://developer.android.com/develop/ui/compose/state">State and Jetpack Compose</a> — why stale UI is usually a source-of-truth bug</li>
      <li><a href="https://developer.android.com/develop/ui/views/layout/declaring-layout">Layouts in Views</a> — inflate once, hold references, call setters (the imperative side)</li>
      <li><a href="https://developer.android.com/topic/architecture/ui-layer">UI layer (Android architecture)</a> — where declarative UI sits in the recommended app structure</li>
    </ul>
  </div>
</details>

## Why the paradigm matters

The first Compose bug I chased on a real screen was not a missing import or a bad modifier. The UI looked correct on first load, then stopped updating after a network refresh. The list adapter had new data; the composable tree did not. That is the moment the imperative vs declarative split stops being textbook vocabulary and becomes a production constraint.

In the View system you **mutate widgets**: find a `TextView`, call `setText`, toggle `visibility`. In Compose you **describe UI from state** and let the runtime reconcile. Mix the two mental models in one feature and you get subtle bugs — stale UI, duplicated sources of truth, or recompositions that never fire because nothing observable changed.

Most new Android work is declarative (Compose or declarative-flavored XML). You still need the imperative model for interop, legacy surfaces, and SDK widgets Compose does not wrap yet. The useful question is not “which is better?” but **where state lives** and **who is allowed to change the UI**.

## Imperative: Views you touch by hand

Classic Android UI is XML layout + Activity/Fragment code. You inflate a hierarchy once, hold references, and push updates imperatively.

```xml
<!-- res/layout/activity_main.xml -->
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp">

    <TextView
        android:id="@+id/myTextView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Hello, Android!"
        android:textSize="18sp"/>

    <Button
        android:id="@+id/myButton"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Click me"/>
</LinearLayout>
```

```kotlin
class MainActivity : AppCompatActivity() {
    private lateinit var myTextView: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        myTextView = findViewById(R.id.myTextView)
        findViewById<Button>(R.id.myButton).setOnClickListener {
            // imperative: poke the widget when something happens
            myTextView.text = "Button clicked!"
        }
    }
}
```

This works until state spreads: loading flags in the Activity, partial updates in an adapter, visibility toggles in a ViewHolder, and a ViewModel that also thinks it owns the same text. Each layer can “fix” the UI independently. Debugging means tracing **who last wrote the widget**.

## Declarative: Compose and the recomposition contract

Jetpack Compose flips the contract. Composable functions take inputs (state) and emit UI. When inputs change, Compose **recomposes** — re-invokes the functions that depend on changed data, skipping stable subtrees when it can.

```kotlin
@Composable
fun GreetingScreen() {
    var text by remember { mutableStateOf("Your text here") }

    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("Hello, Android!", style = MaterialTheme.typography.headlineSmall)
        Spacer(Modifier.height(16.dp))
        TextField(
            value = text,
            onValueChange = { text = it },
            label = { Text("Enter your text") },
            modifier = Modifier.fillMaxWidth()
        )
    }
}
```

There is no `setText` on a retained `TextField` instance. If `text` does not live in observable state (`mutableStateOf`, `StateFlow` collected as state, etc.), typing or async updates will appear to “do nothing.” That failure mode is the declarative equivalent of forgetting to call a View setter — except the compiler will not save you unless you wire state correctly.

The [Compose mental model](https://developer.android.com/develop/ui/compose/mental-model) doc puts it plainly: recomposition is not a full-screen redraw every time; it is a targeted re-run of composables whose inputs changed. Production wins come from aligning state ownership (ViewModel + UI state), stable keys in lists, and avoiding hidden mutation inside composables.

## “More declarative” XML (still imperative under the hood)

Before Compose, teams pushed XML toward declarative *style* without changing the runtime model:

- **ConstraintLayout** — flat constraints instead of nested `LinearLayout` math
- **Data binding** — `android:text="@{viewModel.myText}"` to bind XML to observable fields
- **Styles/themes** — structure in layout, appearance centralized

```xml
<layout xmlns:android="http://schemas.android.com/apk/res/android">
    <data>
        <variable name="viewModel" type="com.example.MyViewModel" />
    </data>
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@{viewModel.myText}" />
</layout>
```

Data binding reduces boilerplate `findViewById` + `setText`, but something still must notify the binding when `myText` changes. You moved the update trigger, not the paradigm. That is why migrating a bound XML screen to Compose is not a line-for-line translation — you redesign **what is state** and **what is derived UI**.

## Comparison at a glance

<img src="{{ site.baseurl }}/images/posts/imperative-vs-declarative-android-ui/comparison-table.png" alt="Comparison table of imperative vs declarative Android UI approaches" width="100%" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 1. Imperative vs declarative tradeoffs across update model, state ownership, interop, and where each approach fits.*

## When imperative still wins

Compose is not a full replacement on day one. Imperative View code remains the right tool when:

- **Platform/SDK gaps** — ads, maps, or vendor widgets without a Compose equivalent ([`AndroidView`](https://developer.android.com/develop/ui/compose/migrate/interoperability-apis/views-in-compose) wraps these; custom Views may still be simpler)
- **Incremental migration** — embed Compose in XML via [`ComposeView`](https://developer.android.com/develop/ui/compose/migrate/interoperability-apis/compose-in-views), or host legacy Views inside Compose with `AndroidView`
- **Performance-sensitive custom drawing** — a hand-tuned `View` may beat a naive composable until you invest in Canvas-level Compose

On large apps, hybrid screens are normal. The discipline is boundary design: pass state down, events up; do not let an Activity silently `findViewById` while a sibling composable also drives the same field.

## Migration pain I keep seeing

Moving high-traffic surfaces from XML/adapters to Compose surfaces the same classes of bugs:

1. **Dual writers** — ViewModel updates data but nothing observable triggers recomposition (fix: expose `StateFlow`/`State`, collect with `collectAsStateWithLifecycle`)
2. **Identity churn in lists** — unstable keys cause scroll jank and state loss (fix: stable `key` in `LazyColumn`)
3. **One-off side effects in composables** — network calls or `setText` analogs in `@Composable` bodies (fix: `LaunchedEffect`, callbacks, ViewModel)
4. **Assuming XML lifecycle tricks port verbatim** — `onSaveInstanceState` patterns map to `rememberSaveable`, not copy-paste

The declarative win is not fewer lines on paper. It is **one directional data flow** from state to UI, which scales when multiple engineers touch the same screen over years.

## References

- [Using Views in Compose](https://developer.android.com/develop/ui/compose/migrate/interoperability-apis/views-in-compose) — `AndroidView` interop
- [Using Compose in Views](https://developer.android.com/develop/ui/compose/migrate/interoperability-apis/compose-in-views) — `ComposeView` for incremental migration
