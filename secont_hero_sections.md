# 🚀 Interactive Hero Section (Portfolio)

## 📌 Overview

This hero section creates a **premium interactive effect on hover** using **pure CSS + JavaScript (CPU-based rendering)** — no WebGL required.

It mimics modern websites (like Lando Norris) with:

* Image morph/reveal effect
* Smooth hover transitions
* Mouse-follow interaction
* Lightweight and fully compatible across devices

---

## 🎯 Features

### ✅ 1. Dual Image Morph Effect

* Uses **two layered images**

  * Base image (default state)
  * Hover image (enhanced version)
* On hover → second image reveals smoothly

---

### ✅ 2. Clip-path Reveal Animation

* Uses `clip-path: circle()` to create a **mask reveal effect**
* Expands from center or cursor position
* Gives a **shader-like transition feel without WebGL**

---

### ✅ 3. Smooth Transition Effects

* Zoom (`scale`)
* Blur (`filter`)
* Brightness/contrast adjustments
* All transitions are GPU-optimized CSS properties

---

### ✅ 4. Cursor-Based Interaction

* Reveal follows mouse movement
* Creates a **dynamic and interactive experience**

---

### ✅ 5. Lightweight & Accessible

* No heavy libraries required
* Works on all browsers and devices
* CPU-friendly (no GPU/WebGL dependency)

---

### 🔹 Text Animation (Split Characters)

* Animate each letter using `span`
* Creates modern entrance effects

---

## 🧠 Design Tips

* Use a **high-quality base image**
* Create a **styled version** for hover:

  * Glow effect
  * Higher contrast
  * Background removed (PNG preferred)
* Keep transitions smooth (0.4s–0.8s)

---

## ⚙️ Tech Stack

* HTML5
* CSS3 (clip-path, filter, transform)
* Vanilla JavaScript

---

## 🚀 Future Upgrades

* SVG distortion filters
* Canvas-based effects (2D)
* GSAP animations
* Optional Rive integration for UI elements

---

## 💡 Summary

This hero section provides:

* Premium interaction feel
* Lightweight performance
* Easy implementation
* No dependency on heavy graphics libraries

👉 Perfect for modern portfolios that need to stand out without sacrificing performance.
