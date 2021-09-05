---
title:  "Auto Clicker"
date:   2017-06-19 11:00:00
#categories: [Course]
tags: [Research]
where: [MobiSys Demo] 
---

<br/>AutoClicker is a fully automated UI testing system for large-scale Android apps using multiple 
devices. 

It provides a way to quickly and easily verify that a large number of Android apps behave 
correctly at runtime in a repeatable manner.

<div class="video_container"> 
<iframe class="responsive-iframe" src="https://www.youtube.com/embed/_hreL1KBLms" frameborder="0" allowfullscreen="true"></iframe>
</div>

<br/>

- <a href="https://dl.acm.org/doi/10.1145/3081333.3089330" target="_blank">Demo Paper</a>, 
<a href="images/posts/autoclicker/poster.pdf" target="_blank">Poster</a>


---
### Motivation
Recently, app instrumentation techniques are widely used for research in academia and in the industry to achieve different goals.

- Improving energy efficiency for always-on sensing
- Providing mobile deep links

One can easily check that instrumented apps are correctly transformed at compilation time with compiler validation.

However, verifying if a large number of instrumented apps behave correctly at runtime is still challenging and timeconsuming.

- Difficult to schedule many apps for testing and to use multiple devices in parallel in order to facilitate testing
- Burden to understand app testing APIs and libraries, and to build a system using them.

<br/>

---

<img src="../images/posts/autoclicker/architecture.png" alt="drawing" width="500"/>

### Architecture
- **Device Controller** - Detecting all devices connected to AutoClicker, and checking device conditions such as battery level, occupied status, and so on.
- **APK distributor** - Selecting a device and an app that is not tested yet. It installs and launches the app on a device to start testing.
- **UI Inspector** - Inspecting all UI elements and their hierarchy for an app running on a device using Android UI Automator.
- **Random Event Generator** - Generating random UI events such as button clicks and text input.


<br/>