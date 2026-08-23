---
title: "The Middle Box: Proxies on the Phone Path"
excerpt: "Postman was green; the phone was not. A forward proxy proves the wire — until pinning, custom OkHttp, or a release NSC silently empty Charles."
date: 2026-05-22 11:00:00
tags: [Writing, DevEx]
draft: false
---

<details class="post-prereq" markdown="0">
  <summary>Prerequisites</summary>
  <div class="post-prereq__body">
    <p class="post-prereq__hint">Read these first if <strong>Charles / SSL proxying</strong>, <strong>Android network security config</strong>, or <strong>TLS</strong> are new.</p>
    <ul>
      <li><a href="https://www.charlesproxy.com/documentation/using-charles/ssl-certificates/">Charles — SSL certificates</a> — debug CA install; why release builds go silent</li>
      <li><a href="https://developer.android.com/privacy-and-security/security-config">Android — Network security configuration</a> — user CAs, debug overrides, pinning on the phone path</li>
      <li><a href="https://developer.mozilla.org/en-US/docs/Glossary/TLS">MDN — TLS</a> — why HTTPS is opaque without a trusted (or debug) CA</li>
      <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Proxy_servers_and_tunneling">MDN — Proxy servers and tunneling</a> — what a proxy hop is</li>
    </ul>
  </div>
</details>

## Postman was green. The phone was not.

You paste a failing mail sync into Postman. It returns 200. On the device the UI spins, then shows a stale folder. Until someone puts a **middle box** on the path, the debate stays superstition: “Android bug,” “backend flake,” “Wi‑Fi.”

A **forward proxy** (Charles, Proxyman, mitmproxy) is that middle box: the phone sends traffic to a machine you control; that machine forwards to the real API and can log, delay, rewrite, or stub what it sees. That is not the same as a **reverse** proxy in front of origins (nginx, gateway, CDN). Mixing those words in a design review is how two teams talk past each other for an hour.

The interesting failures start *after* you “put it on Charles.”

## Charles shows nothing

The first wrong guess is “Charles is broken.” Usually one of these is true:

1. **Wrong hop.** Emulator often reaches the host as `10.0.2.2:8888`. A physical phone needs the laptop’s LAN IP, same Wi‑Fi, and no captive portal fighting you.
2. **Wrong build.** On Android 7+, apps **do not trust user-installed CAs by default**. SSL proxying only works for apps you control, with a debug `network_security_config` that trusts user CAs — typically under `debug-overrides` so release stays strict. A dogfood **release** binary will look “quiet” on Charles forever.
3. **App bypasses the system proxy.** OkHttp (and some SDKs) can ignore the device HTTP proxy. Charles sees zero; Postman still looks fine because it was never on that path.

```xml
<!-- res/xml/network_security_config.xml — debug builds only -->
<network-security-config>
  <debug-overrides>
    <trust-anchors>
      <certificates src="user" />
    </trust-anchors>
  </debug-overrides>
</network-security-config>
```

When the capture is empty, the next question is not “is the API up?” — it is “did this process actually route through the middle box?”

## Decrypt works — then pinning kills it

HTTPS through a normal hop is gibberish. Charles works by becoming a **debug CA**: you install its root, it mints per-host leaves, decrypts for the UI, re-encrypts upstream. That is deliberate MITM — correct in lab, wrong as a production trust model.

**Certificate pinning** will still reject Charles’s forged leaf even when the user CA is trusted — by design. The symptom looks like “proxy breaks the app,” which is half true: the proxy is doing its job; the pin is doing its job. Unpin or ship a debug build without pins. Do not ship “trust user CAs” or disabled pinning in release.

For example, in a mail app, auth headers and message bodies show up in the capture the moment SSL proxying works. Treat that session like a production log. Scrub before Slack.

## The capture that changes the bug

Once traffic is visible, the interesting bugs stop being “Android vs backend”:

- Response is 200 but body is empty / wrong shape — UI code was never the root cause.
- Intermittent 5xx during a [backend rollout]({{ site.baseurl }}/docker-and-kubernetes-backend-servers) — aggressive client retries look like an app hang ([retry storms]({{ site.baseurl }}/retry-storms-client-ddos)).
- **Throttle** the link in Charles and watch sync/retry policy: many “Compose jank” tickets are radio + backoff, not `LazyColumn`.

> **Rule of thumb** - if Postman and the phone disagree, get a capture before you rewrite the list. If Charles is empty, debug the hop and the build — not the Compose state.

Charles proves what the wire did. Empty captures and pinning fights are not tool trivia; they are why teams waste a day on the wrong layer.

## References

- [API up, still broken on phones (this site)]({{ site.baseurl }}/api-up-still-broken-on-phones)
- [Retry storms (this site)]({{ site.baseurl }}/retry-storms-client-ddos)
- [Certificate pinning (OWASP)](https://owasp.org/www-community/controls/Certificate_and_Public_Key_Pinning) — why Charles goes dark on release builds
