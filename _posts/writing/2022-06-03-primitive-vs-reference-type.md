---
title: "Primitive vs Reference Types: Memory, Boxing, and Kotlin Nulls"
date: 2022-06-03 12:45:00
tags: [Writing, Systems]
draft: false
---

## Why "same variable" stores different things

A bug that only shows up after ProGuard/R8, or only when a nullable `Int?` slips through Compose state, often starts with the same confusion: **what does this variable actually hold?** In Java and Kotlin on Android, the answer depends on whether the type is **primitive** or **reference** — and Kotlin adds nullable wrappers that look like primitives but are not.

## Primitive types — the value lives in the slot

Primitive types are the built-in scalar kinds: `boolean`, `char`, `byte`, `short`, `int`, `long`, `float`, `double` in Java; Kotlin adds unsigned variants and treats `Boolean`, `Char`, etc. as primitives at the JVM level when compiled.

When you write:

```java
int a = 5;
```

The memory location for `a` **contains the value 5**. No indirection. Copying a primitive copies the bits:

```java
int b = a;   // b gets its own 5; changing b does not change a
```

That predictability is why primitives are the default for counters, flags, and hot loops — no aliasing surprises, no `NullPointerException` on the slot itself.

## Reference types — the slot holds an address

Class types, arrays, interfaces, and `String` are **reference types**. The variable stores a **reference** (address) to an object on the heap, not the object's fields inline.

```java
SomeClass obj = new SomeClass();
```

Looking at `obj` in memory shows a pointer; the object's fields live elsewhere. **Class type, object type, and reference type mean the same thing** — different textbooks, one idea.

<img src="{{ site.baseurl }}/images/posts/primitive-vs-reference-type/memory-model.png" alt="Diagram comparing primitive variable storing value 5 directly versus reference variable storing address to heap object" width="67%" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 1. Primitives store values; reference variables store addresses to heap objects.*

Assignment copies the **reference**, not a deep clone:

```java
SomeClass a = new SomeClass();
SomeClass b = a;   // both point at the same instance
b.setFlag(true);   // visible through a
```

That aliasing is correct for objects; it is a common source of "I thought I copied it" bugs with mutable lists and shared ViewModels.

## Kotlin on Android — what looks primitive often is not

Kotlin's `Int`, `Boolean`, and `Double` compile to JVM primitives **when they are non-null locals and parameters**. But **`Int?`, `Boolean?`, and generic type parameters are boxed** — they become `Integer`, `Boolean`, etc. on the heap.

```kotlin
var count: Int = 0        // primitive on JVM
var maybe: Int? = null    // java.lang.Integer wrapper when nullable

listOf(1, 2, 3)           // List<Int> — elements boxed as Integer
```

**Pitfalls that show up in production:**

1. **Nullability vs primitive.** `if (maybe != null) maybe + 1` unboxes safely; storing `maybe` in a Java API expecting `int` without a check throws NPE. Compose `remember { mutableStateOf<Int?>(null) }` forces you to handle absent vs zero explicitly — they are different states.

2. **Autoboxing in collections and generics.** `List<Int>` cannot use primitive arrays under the hood; each element may allocate. For large numeric buffers use `IntArray` / `LongArray`, or Android's `SparseIntArray` when keying by id.

3. **Identity vs equality on boxed types.** `Integer.valueOf(127) == Integer.valueOf(127)` may be true (cache); `128 == 128` with boxed integers compared by reference can fail. Prefer `===`/`==` on primitives; for nullable wrappers use structural equality after null checks.

4. **Platform types from Java.** Android SDK and older libraries expose `@Nullable`/`@NonNull` inconsistently. Kotlin sees Java `String` as `String!` — assignable to both `String` and `String?`. Interop bugs cluster at those boundaries.

```kotlin
// Java: void setCount(Integer count)
fun updateFromJava(value: Int?) {
    api.setCount(value)  // null may or may not be legal — check SDK contract
}
```

5. **R8 and reflection.** Code that assumes a field is `int` but is actually `Integer` after Kotlin compilation can break reflective access or serialization. Release-build-only crashes here often trace back to type erasure and boxing, not "random" shrinker bugs.

## Quick decision guide

| Situation | Prefer |
|-----------|--------|
| Local counter, loop index | Non-null primitive (`Int`, `Boolean`) |
| Absent vs zero distinct | Nullable (`Int?`) — accept boxing cost |
| Large numeric array | `IntArray` / `FloatArray`, not `List<Int>` |
| Shared mutable object | Reference type + clear ownership |
| Java interop parameter | Match SDK nullability; avoid `!!` at boundaries |

In Compose, the same distinction shows up in **what triggers recomposition**. A `mutableIntStateOf(0)` tracks a primitive-backed slot; `mutableStateOf<Int?>(null)` tracks a nullable wrapper and a different "empty vs zero" story for your UI. Picking the wrong one is not a style issue — it is a state contract.

Understanding the split does not make you avoid objects — it tells you **where aliasing, null, and allocation happen** before they become ANRs or release-only NPEs.

## References

- [Primitive type declaration — Java Language Specification](https://docs.oracle.com/javase/specs/jls/se17/html/jls-4.html#jls-4.2)
- [Kotlin: Java to Kotlin migration guide — nullability and platform types](https://kotlinlang.org/docs/java-to-kotlin-nullability-guide.html)
- [Android performance patterns — avoid autoboxing](https://developer.android.com/training/articles/perf-tips#AvoidAutoboxing) (classic guidance; still relevant for hot paths)
