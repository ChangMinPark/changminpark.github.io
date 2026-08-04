---
title: "OpenGL Rendering Pipeline: What Actually Breaks in Practice"
excerpt: "Map OpenGL stages to contracts. Localize pose, culling, and fragment bugs instead of guessing at FPS cliffs."
date: 2021-07-02 12:30:00
tags: [Writing, Systems]
draft: false
---

## Why the pipeline map matters

OpenGL turns vertex and index buffers into pixels through a short chain of stages. Treat each stage as a **contract**, and “mystery” bugs get local: wrong pose → vertex stage, missing faces → assembly, FPS cliff → fragment/fill, flicker → depth.

If you already know Android UI or systems work and only skimmed OpenGL/ES, you do not need another glossary. You need somewhere to point when the screen is wrong — the debugging map I wish I’d had when a mesh looked “almost right” and I could not tell which stage owned the failure.

Wrong pixels are rarely “the GPU is broken.” They are usually **data that violated a stage’s contract**. That same vocabulary shows up in systems work later — for example in [Rushmore]({{ site.baseurl }}/rushmore), where the hard question is not only how fragments are shaded, but **which world may write which display path** before pixels hit the panel.

Others already cover the fundamentals well ([LearnOpenGL — Hello Triangle](https://learnopengl.com/Getting-started/Hello-Triangle), the [Khronos pipeline overview](https://www.khronos.org/opengl/wiki/Rendering_Pipeline_Overview)). This post sits beside those as a stage map: when something looks wrong, name the stage before changing random GL state.

## Pipeline overview

OpenGL-managed memory usually starts with two arrays:

- **Vertex array** — positions (and attributes) that become screen-space points, triangles, fragments, then colors
- **Element (index) array** — which vertices form triangles; order matters

The overview figure below (from Joe’s modern OpenGL intro — credited in References):

<img src="{{ site.baseurl }}/images/posts/opengl-rendering-pipeline/pipeline-overview.png" alt="OpenGL pipeline from vertex and element arrays through shaders to the framebuffer" width="500px" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 1. Pipeline overview — vertex/element inputs, programmable stages, framebuffer output.*

Desktop pipelines can also insert optional tessellation and geometry stages between the vertex shader and the rasterizer. Mobile GLES 2/3 — the more common target for app engineers debugging a phone build — usually skips both, so this map sticks to the stages you will actually hit in that world.

## Vertex shader — geometry that “moves”

The GPU reads each selected vertex. The **vertex shader** projects it (typically into clip space) and may emit varyings — color, UVs — for later interpolation.

When the mesh loads and the silhouette looks familiar but sits off-camera or paper-thin, skip the fragment shader. Check model/view/projection, attribute stride, or a forgotten homogeneous `w` first. That bug almost never starts in rasterization.

```glsl
#version 330 core
layout (location = 0) in vec3 aPos;
uniform mat4 uMVP;

void main() {
  // why: clip-space position is the contract for later stages
  gl_Position = uMVP * vec4(aPos, 1.0);
}
```

## Triangle assembly — connectivity bugs look random

Projected vertices become triangles as independent triples, a **strip** (reuse last two vertices), or a **fan** (first vertex + later pairs):

<img src="{{ site.baseurl }}/images/posts/opengl-rendering-pipeline/triangle-assembly.png" alt="Triangle list, strip, and fan assembly modes" width="180px" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 2. Triangle assembly modes.*

Faces that disappear or twist after you “just” change draw mode usually live here. One index drives **all** attributes — you cannot index positions and UVs independently. If holes appear after switching `GL_TRIANGLES` ↔ strip, blame assembly before the fragment shader.

Winding order compounds this: OpenGL treats counter-clockwise as front-facing by default, and back-face culling silently drops any triangle wound the other way. If a mesh renders fine with `GL_CULL_FACE` disabled but vanishes (or shows only its inside faces) once you enable it, you flipped a normal or imported geometry with inconsistent winding — that is an assembly/culling bug, not a rasterizer or lighting one.

## Rasterization — triangles become fragments

Each triangle is clipped, then broken into pixel-sized **fragments**. Vertex outputs are interpolated across the surface:

<img src="{{ site.baseurl }}/images/posts/opengl-rendering-pipeline/rasterization.png" alt="Rasterization turning a triangle into pixel-sized fragments" width="220px" style="margin-top: 0px; margin-bottom: 8px;"/>

*Figure 3. Rasterization produces fragments for the fragment shader.*

A few thousand triangles with collapsing FPS when the camera fills the screen is often fill rate, not vertex count — especially on mobile. A full-screen quad with a heavy shader can out-cost a denser mesh that covers fewer pixels. Measure before “optimizing the mesh.”

## Fragment shader — the usual performance villain

For each fragment, the **fragment shader** decides color (textures, lighting, effects). It runs **per covered pixel**, which is why it dominates cost for many real apps.

Smooth until you turn the camera? You just covered more pixels or more layers. Transparent UI over 3D and naive multi-pass effects tax this stage hard on phones.

Alpha blending adds a second failure mode that looks like a shader bug but is not: unsorted transparent draws blend in whatever order the CPU submitted them, so overlapping glass, particles, or UI panels can render with the wrong surface “winning” even though every fragment shader is individually correct. Sort transparent geometry back-to-front (or use an order-independent technique) before you start rewriting blend math.

```glsl
#version 330 core
in vec2 vUV;
uniform sampler2D uTex;
out vec4 FragColor;

void main() {
  // why: keep this cheap — it may run millions of times per frame
  FragColor = texture(uTex, vUV);
}
```

## Frame buffer — depth and stencil are product features

Before a fragment sticks, tests filter it into color, depth, and stencil buffers.

| Buffer | Job |
|--------|-----|
| Color | What you see |
| Depth | Occlusion (farther fragments discarded) |
| Stencil | Mask drawable regions |

Z-fighting between coplanar surfaces, or a HUD that vanishes behind geometry, is a depth/draw-order problem — disable depth for overlays on purpose. Stencil shows up when you need a hard mask (portal, mirror region, UI punch-through): draw the shape into the stencil buffer first, then constrain later color writes to that mask.

## References

- Figures from Joe’s *An intro to modern OpenGL — Chapter 1: The Graphics Pipeline* ([duriansoftware.com](https://duriansoftware.com/joe/An-intro-to-modern-OpenGL.-Chapter-1:-The-Graphics-Pipeline.html))
- [Rendering Pipeline Overview — OpenGL Wiki](https://www.khronos.org/opengl/wiki/Rendering_Pipeline_Overview)
- [LearnOpenGL — Hello Triangle](https://learnopengl.com/Getting-started/Hello-Triangle)
- Site: [Rushmore]({{ site.baseurl }}/rushmore)
