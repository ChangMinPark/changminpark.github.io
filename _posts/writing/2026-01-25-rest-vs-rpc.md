---
title: "REST vs RPC: Same HTTP, Different Contracts"
excerpt: "REST models resources; RPC models procedures. They are alternatives for API shape — and your Android client feels the difference."
date: 2026-01-25 11:10:00
tags: [Writing, Distributed]
draft: false
---

<details class="post-prereq" markdown="0">
  <summary>Prerequisites</summary>
  <div class="post-prereq__body">
    <p class="post-prereq__hint">Read these first if <strong>REST as an architectural style</strong>, <strong>RPC</strong>, or <strong>HTTP methods/URLs</strong> are new.</p>
    <ul>
      <li><a href="https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm">Fielding — REST (ch. 5)</a> — resources and uniform interface, not “JSON over GET”</li>
      <li><a href="https://grpc.io/docs/what-is-grpc/core-concepts/">gRPC core concepts</a> — RPC as named procedures, often on HTTP/2</li>
      <li><a href="https://en.wikipedia.org/wiki/Remote_procedure_call">Remote procedure call</a> — the older “call a function on another process” model REST is an alternative to</li>
      <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview">HTTP overview (MDN)</a> — methods, URLs, status codes; the shared pipe both ride</li>
    </ul>
  </div>
</details>

## “Is this a REST API or an RPC?”

Design reviews often treat **REST** and **RPC** as rival products. They are closer to rival **vocabularies** for the same problem: how should one process ask another for work over the network?

Both can ride HTTP. Both can return JSON. Both can power a mobile app. The fork is what you name and version: **resources you manipulate**, or **procedures you call**.

This post is the contract-level distinction — not a bake-off of gRPC vs Spring Boot, and not the cellular round-trip story in [Fat vs Chatty APIs]({{ site.baseurl }}/fat-vs-chatty-apis-cellular). Those concerns stack; they do not replace each other.

## Related reading

- **Internal:** [Fat vs Chatty APIs on Cellular]({{ site.baseurl }}/fat-vs-chatty-apis-cellular) — payload shape and RTT on phones
- **Internal:** [Three Clients, Same Aggregation]({{ site.baseurl }}/bff-three-clients-same-aggregation) — where aggregation lives when clients disagree
- **External:** [Fielding’s REST dissertation (ch. 5)](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm); [gRPC docs — core concepts](https://grpc.io/docs/what-is-grpc/core-concepts/); [Postman — gRPC vs REST](https://blog.postman.com/grpc-vs-rest/)

## Two ways to carve the surface

**REST** (Representational State Transfer) is an architectural *style*. In the HTTP mapping most teams mean: URLs name **resources**, verbs (`GET` / `POST` / `PUT` / `PATCH` / `DELETE`) say what to do, status codes carry outcomes, and clients navigate representations. Idealized REST is more than “JSON over GET”; day-to-day “REST APIs” are usually **resource-oriented HTTP**.

**RPC** (Remote Procedure Call) names **operations**. The client invokes something that looks like a function: `GetUser`, `CreateOrder`, `SendMessage`. Classic RPC stacks (ONC RPC, CORBA, Java RMI) made that literal. Modern cousins — **gRPC**, JSON-RPC, many “`POST /api/v1/sendMessage`” endpoints — keep the *procedure* as the unit of design even when the wire is HTTP/2 + Protobuf or HTTP + JSON.

| | Resource-oriented (REST-ish) | Procedure-oriented (RPC-ish) |
|--|------------------------------|------------------------------|
| Unit of design | Noun / resource | Verb / method |
| Example | `GET /users/42` | `GetUser(id=42)` or `POST /rpc/GetUser` |
| Uniform interface | Shared HTTP verbs + status | Per-service method catalog |
| Typical public web/mobile edge | Common | Less common (except RPC-over-HTTP) |
| Typical service-to-service | Fine | Common (gRPC, etc.) |
| Streaming | Possible; not the default mental model | First-class in gRPC (uni/bi-directional) |

They are **alternatives** for how you model the contract. They are not mutually exclusive technologies: a shop can expose REST at the edge and gRPC between services, or run RPC-shaped JSON on the same API gateway that also hosts CRUD resources.

## What the phone actually notices

From an Android client, the label on the wiki matters less than three practical facts.

**1. Client shape.** Retrofit/`OkHttp` against resource URLs feels natural for CRUD screens. gRPC (or a generated RPC stub) feels natural when the backend already speaks Protobuf and methods. Either way you still own timeouts, cancellation, and “what does a partial failure mean for this screen?”

**2. Chatty vs fat is orthogonal.** Six `GET`s per list row is a REST *usage* smell; six tiny RPCs is the same smell with different names. Aggregating for cellular ([fat vs chatty]({{ site.baseurl }}/fat-vs-chatty-apis-cellular)) can sit behind a BFF whether the BFF’s public face is resource JSON or a `GetInboxPage` RPC.

**3. Evolution and tooling.** Resource APIs lean on HTTP caching semantics, CDN habits, and browser-friendly debugging. RPC/gRPC leans on shared schemas, codegen, and (for gRPC) binary framing that is awkward in a browser without a gateway. Public partner integrations still skew REST-ish for that reason; internal meshes often skew RPC for throughput and typing — a pattern many eng blogs describe as hybrid rather than winner-take-all ([freeCodeCamp on REST / gRPC / events](https://www.freecodecamp.org/news/service-to-service-communication-when-to-use-rest-grpc-and-event-driven-messaging/), [Toptal on gRPC vs REST](https://www.toptal.com/developers/grpc/grpc-vs-rest-api)).

## False fights worth skipping

**“RPC is faster, so use it everywhere.”** Binary Protobuf and HTTP/2 multiplexing can win on internal latency. On a phone, radio RTT and round-trip *count* usually dominate serialization microbenchmarks. Faster framing does not forgive a chatty screen contract.

**“If it uses POST, it isn’t REST.”** Plenty of resource APIs use `POST` for non-idempotent creates or actions. Plenty of “REST” APIs are RPC in a trench coat (`POST /getUser`). Judge by whether **resources and uniform verbs** are the organizing idea — not by whether someone pasted OpenAPI into Confluence.

**“GraphQL replaces both.”** GraphQL is a third vocabulary: the client shapes a query document. It is neither classic REST nor classic RPC, though it often replaces a cluster of chatty GETs the way a fat BFF method would.

## When I’d reach for which

Prefer **resource-oriented HTTP** when many clients (including browsers and partners) need a stable, cache-friendly vocabulary over entities, and when human debuggability at the edge matters.

Prefer **RPC** (often gRPC internally) when both ends are under your control, you want a typed method catalog, streaming, or tight service-to-service loops — and you are willing to run codegen and a gateway where browsers or partners appear.

Prefer **both** when the edge must stay boring and the mesh must stay fast. Put aggregation where product screens need it ([BFF]({{ site.baseurl }}/bff-three-clients-same-aggregation)); do not pretend the wire style alone fixed cellular physics.

## References

- [gRPC vs REST (Postman)](https://blog.postman.com/grpc-vs-rest/) — accessible side-by-side of styles and tooling
- [Service-to-service: REST, gRPC, and events (freeCodeCamp)](https://www.freecodecamp.org/news/service-to-service-communication-when-to-use-rest-grpc-and-event-driven-messaging/) — hybrid production pattern
- [gRPC vs REST (Toptal)](https://www.toptal.com/developers/grpc/grpc-vs-rest-api) — performance and when complexity pays off
