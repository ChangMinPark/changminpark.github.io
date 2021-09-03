---
title:  "Automated Hand Model"
date:   2015-11-01 12:00:00
#categories: [Course]
tags: [Course]
where: [Realtime Embed Systems]
---


<br/>This automated hand model was a term project in embedded system course. 
It is designed for handicapped people who cannot freely move their hands. 

This automated hand model has 4 buttons that are mapped with certain movements, and
handicapped people can use this as a real hand by wearing this and pressing the buttons. 
Also by using a light detector, it can grab whatever that is closed to its palm.  

<div class="video_container"> 
<iframe class="responsive-iframe" src="https://www.youtube.com/embed/E8ypOCsl18E" frameborder="0" allowfullscreen="true"></iframe>
</div>



<br/>

---
<img src="../images/posts/automated-hand-model/picture1.png" alt="drawing" width="700"/>

### Component Used
- 1 Arduino Uno board
- 4 switch buttons
- 7 servos
- 1 light dependence resistor
- 1 wooden hand
- Fishing wire
- Black elastic cord
- Hook screws

<br/>

---
<img src="../images/posts/automated-hand-model/picture2.png" alt="drawing" width="900"/>

### Description
- On a back of each finger, there is a black elastic cord pulling the finger 
when there is no movement. There are hook screws on finger knuckles, and I connected 
the servo with each finger with fishing line.
- There are four buttons are on the Arduino. This automated hand waits for the buttons 
to be pressed. Each button has certain saved movements. By pressing the each button 
will make the hand fingers to move.
- Also there is a light dependence resistor which can detect the light changes. If 
people put their hand on this model, the resistor will detect that the light is dimmed, 
and it will perform saved movement which is holding hand by bending fingers.

<br/>

---
### State and Circuite Diagram

<img src="../images/posts/automated-hand-model/state-and-circuite-diagram.png" alt="drawing" width="900"/>


<br/>