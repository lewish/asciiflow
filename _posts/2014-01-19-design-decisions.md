---
layout: default
title: Technology Overview
---
Based on the limitations of ASCIIFlow 1.0, I have decided to change the architecture of the app quite a lot.

Some background
---------------
ASCIIFlow 1.0 was a GWT app, the canvas was a large set of divs arranged neatly together, with a single character value each. At the time, canvas was quite a new thing, support wasn't extensive, so this seemed like a good option.
I spent most of my energy improving the performance of the app. DOM rewrites are expensive, and I needed to do as few as possible. This led to me employing quite a few clever techniques to limit the number of changes made at all times, making sure updates are incremental, storing a mirror of the canvas state in JS variables.

