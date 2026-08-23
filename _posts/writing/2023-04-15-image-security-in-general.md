---
title: "Image Security in General: What Breaks on the Mobile Photo Path"
excerpt: "Photos touch compression, thumbs, CDN, and GPU decode. Where the mobile image path silently weakens security."
date: 2023-04-15 15:10:00
tags: [Writing, Security]
draft: false
---

<details class="post-prereq" markdown="0">
  <summary>Prerequisites</summary>
  <div class="post-prereq__body">
    <p class="post-prereq__hint">Read these first if <strong>CIA triad, authenticity, watermarking, or TrustZone display</strong> are new.</p>
    <ul>
      <li><a href="https://csrc.nist.gov/glossary/term/confidentiality">CIA triad (NIST glossary)</a> — confidentiality, integrity, availability basics</li>
      <li><a href="https://csrc.nist.gov/glossary/term/non_repudiation">Authenticity / non-repudiation</a> — proving origin, not only secrecy</li>
      <li><a href="https://en.wikipedia.org/wiki/Digital_watermarking">Digital watermarking overview</a> — visible vs invisible marks (primer, not product)</li>
      <li><a href="{{ site.baseurl }}/rushmore">Rushmore (this site)</a> — TrustZone secure display threat model on mobile</li>
    </ul>
  </div>
</details>

## Why a photo is harder to secure than a message

Every messaging app encrypts text in transit. Photos look equally protected — until you trace the full path: compression, thumbnails, CDN caching, and a display stack that may decode on a GPU you do not control. At each hop someone can see pixels — the OS, a middle service, or another app with storage access.

That chain is what I studied in dissertation work on mobile image confidentiality and integrity, in Crestone (archived end-to-end integrity research), and in [Rushmore]({{ site.baseurl }}/rushmore) (TrustZone secure display). Generic crypto tutorials treat the file as an opaque blob. Mobile photo security must account for **where pixels become visible**, not just whether ciphertext crossed the network.

<img src="{{ site.baseurl }}/images/posts/image-security-in-general/end-to-end-flow.png" alt="Author captures a photo on a phone, uploads through social apps, user downloads on another device" width="100%" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 1. A typical mobile photo path: capture → upload through third-party services → download on a consumer device.*

Below: four properties, four attack scenarios, four solution families — with mobile tradeoffs textbook crypto often skips.

## Four properties, four failure modes

Image security on phones rests on four fundamentals:

| Property | Question it answers | Typical mobile symptom |
|----------|--------------------|-----------------------|
| **Confidentiality** | Can unauthorized parties see the content? | A relay or backup service reads thumbnails you thought were private |
| **Integrity** | Was the image altered after capture? | A re-shared photo shows events that never happened |
| **Authenticity** | Who actually produced this image? | A fake account uses someone else's photos as identity |
| **Non-repudiation** | Can the producer deny creating it? | A leaker claims the evidence photo "wasn't mine" in court |

The table below ties common problems to property and **where** on the path the attack lands — producer device, middle services, or consumer device:

<img src="{{ site.baseurl }}/images/posts/image-security-in-general/problems-table.png" alt="Table mapping image security problems to confidentiality, integrity, authenticity, non-repudiation and attack places" width="100%" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 2. Problems mapped to security properties and attack surface (device, network, user).*

Generic crypto blogs under-weight two surfaces: **compromised OS / malicious apps** on producer or consumer devices, and **man-in-the-middle** on the sharing path. Transit encryption does not help if the camera pipeline or gallery already leaked pixels locally.

## Attack scenarios

**Confidentiality.** Alice shares a personal photo with Bob; Michael on the relay path reads content meant for two people only.

<img src="{{ site.baseurl }}/images/posts/image-security-in-general/scenario-confidentiality.png" alt="Attacker intercepts a photo shared between two users" width="480px" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 3. Confidentiality break: an intermediary reads the image in transit.*

**Integrity.** Bob downloads a news photo, edits it for dramatic context, and re-uploads. Without tamper detection, misinformation outruns fact-checks.

<img src="{{ site.baseurl }}/images/posts/image-security-in-general/scenario-integrity.png" alt="Attacker manipulates a photo and redistributes through social networks" width="480px" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 4. Integrity break: tampered content re-enters the sharing graph.*

**Authenticity.** Sarah downloads a celebrity's photos and builds a fake account. The platform sees valid JPEGs; the **identity** is wrong.

<img src="{{ site.baseurl }}/images/posts/image-security-in-general/scenario-authenticity.png" alt="Attacker downloads photos, creates fake account, impersonates on social networks" width="480px" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 5. Authenticity break: someone else's images become a fake identity.*

**Non-repudiation.** Alice photographs an unreleased product and leaks it. When traced, she denies taking the photo — without binding proof, attribution fails in court.

<img src="{{ site.baseurl }}/images/posts/image-security-in-general/scenario-non-repudiation.png" alt="Spy leaks product photos, company investigates, spy denies authorship in court" width="400px" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 6. Non-repudiation break: the producer refuses ownership of evidence they created.*

## Solutions and tradeoffs

No single mechanism covers all four properties on a real mobile path. Production systems often stack layers — TLS for transit, C2PA or signatures where metadata survives, watermarks where it does not, forensics as a last resort. Pick based on which failures you cannot tolerate.

### 1. Symmetric-key cryptography

Encrypt pixel bytes (or the container) with a shared secret; decrypt with the same key. Preserves **confidentiality** and **integrity** of the ciphertext — if the key never leaks and nobody must view the image before decryption.

<img src="{{ site.baseurl }}/images/posts/image-security-in-general/symmetric-encryption.png" alt="Plaintext encrypted and decrypted with the same secret key" width="480px" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 7. Symmetric encryption: one secret key for both directions.*

| Upside | Downside |
|--------|----------|
| No visual quality loss | Key must be shared with every viewer |
| Mature, fast on mobile | Breaks on benign transforms (resize, re-encode, "Edit in Photos") |
| | Image not visible until decrypted on the final device |

### 2. Asymmetric-key cryptography

**Public-key encryption:** encrypt with the recipient's public key, decrypt with their private key. Good for **confidentiality** to one party; anyone can encrypt, so it does **not** prove who sent the image.

<img src="{{ site.baseurl }}/images/posts/image-security-in-general/public-key-encryption.png" alt="Plaintext encrypted with public key, decrypted with private key" width="480px" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 8. Public-key encryption: separate encrypt and decrypt keys.*

**Digital signatures** hash raw pixel values, sign with the producer's private key, attach as metadata. Receivers verify with the public key — **authenticity** and **integrity** while the image stays visible.

<img src="{{ site.baseurl }}/images/posts/image-security-in-general/digital-signature.png" alt="Hash and sign pixel values; verify after transit tampering zone" width="100%" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 9. Digital signature over image hashes — visible image, verifiable origin.*

| Upside | Downside |
|--------|----------|
| No quality loss; image viewable before verify | Fragile to benign recompression unless you use perceptual hashing |
| Proves sender without sharing a secret | Metadata often stripped by social platforms (screenshot, re-upload) |
| | Larger keys → slower sign/verify on low-end phones |

Mobile display research diverges here: signing the **file** fails if the gallery only loads decoded bitmaps and never surfaces the signature. Bind proof to what reaches the panel — the problem [Rushmore]({{ site.baseurl }}/rushmore) tackled with a secure display channel.

### 3. Watermarking

Embed authentication data **inside** pixels — spatial domain (e.g. LSB) or transform domain (DCT/DWT, survives JPEG better). Preserves **authenticity** and **integrity** without a sidecar file.

<img src="{{ site.baseurl }}/images/posts/image-security-in-general/watermark.png" alt="Insert watermark with security context, detect tampered region after transit" width="100%" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 10. Watermark embedded in content; tampered regions detectable on verify.*

| Upside | Downside |
|--------|----------|
| Survives formats that drop EXIF/metadata | Visible or invisible quality cost |
| Works when services strip headers | Collage, statistical, and noise attacks against weak schemes |
| Robust transform-domain marks tolerate compression | Key management for secure detection is its own system |

### 4. Digital image forensics

Detect tampering **without** the original — pixel inconsistencies, shadow physics, semantic oddities (GAN artifacts). Post-hoc **integrity** detection.

<img src="{{ site.baseurl }}/images/posts/image-security-in-general/digital-forensics.png" alt="Forensic markers on manipulated faces and deepfake tells" width="100%" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 11. Media and semantic forensics: physical inconsistencies and deepfake tells.*

| Upside | Downside |
|--------|----------|
| No enrollment at capture time | Adversarial editing adapts to detectors |
| Works on screenshots and re-uploads | Real-time on-device analysis is still expensive |
| Complements metadata credentials (e.g. C2PA) when present | Cannot alone prove who captured the scene |

## Related reading

- **Internal:** [Rushmore]({{ site.baseurl }}/rushmore) — secure display on ARM TrustZone. Crestone (archived ’23 research) — end-to-end image integrity on mobile.
- **Provenance today:** [C2PA Content Credentials explained](https://synthguard.net/blog/c2pa-content-credentials-explained) — signed manifests in metadata; strong when preserved, gone after most social re-uploads.
- **Watermarking as a system:** [Visible, invisible, and forensic watermarking](https://wp.nyu.edu/leonardnsternschoolofbusiness-forensicwatermarking/2026/03/05/watermarks-protecting-digital-content-with-visible-invisible-and-forensic-watermarking/) — embedding plus keys, detection workflow, and threat model.
- **Passive forensics:** [Amped Authenticate overview](https://www.forensicfocus.com/podcast/digital-image-authenticity-and-integrity-with-amped-authenticate/) — blind content analysis when no signed envelope exists.

## References

### Public-key infrastructure
- [Trust Models in Public Key Infrastructure](https://www.researchgate.net/publication/320537664_Trust_Models_in_Public_Key_Infrastructure) (ACSIT '17)
- [Everything you should know about certificates and PKI](https://smallstep.com/blog/everything-pki/) (smallstep.com)
- [PGP Web of Trust: Core Concepts](https://www.linux.com/training-tutorials/pgp-web-trust-core-concepts-behind-trusted-communication/) (Linux.com)
### Watermarking and authentication surveys
- [Methods for image authentication: a survey](https://doi.org/10.1016/j.patcog.2006.06.008) (166 citations)
- [Review on Semi-Fragile Watermarking Algorithms](https://doi.org/10.3390/fi9040056) (Future Internet '17)
- [Secure Watermarking Schemes in IoT: An Overview](https://doi.org/10.3390/s21165505) ('21)
- [A survey of deep neural network watermarking techniques](https://doi.org/10.1016/j.neucom.2021.05.104) ('21)
