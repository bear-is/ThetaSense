# ThetaSense

**ThetaSense** is a web app for constructing and simulating power networks in real time.

The backend is written in **Java** and sends network data to the frontend using **webhooks** and **CRUD requests** in `GridServer.java`.  
The frontend is built with **Node.js**, **React**, and **D3.js**, allowing you to visually connect nodes to simulate power demands.

---

## Overview

- **Nodes** represent power generators and loads  
- **Edges** represent transmission lines with impedance (sample: `0.3 Ω/km`)  
- The network is stored as a **directed graph**  
- A matrix-based DC power flow solver computes **efficiency metrics**  
- Random tick updates simulate **changes in power demand**  

The main idea: create a power distribution network and see how efficiency changes with **node placement** and **transmission line additions**.
Power grid designers could then use this program to simulate, predict, and understand potential changes to existing electrical infastructure.

---

##  Tech Stack

**Backend**:

- Java (`PowerGrid.java`, `GridServer.java`)  
- DC power flow solver  
- Webhooks and POST requests  

**Frontend**:

- Node.js  
- React  
- Vite  
- D3.js for interactive visualization  

---

## 🚀 Running ThetaSense

### 1️⃣ Install Node and Vite


npm install -g npm
npm create vite@latest my-project



To run:
install npm: npmjs.com
install VITE npm create vite@latest my-project idk just figure it out i guess
run the node from the source folder using  npm run dev
build and run the backend server PowerGrid.java
open the locally hosted website (http://localhost:5173/)

 Features

Build custom power networks

Connect generators and loads dynamically

Simulate random demand changes

Visualize network efficiency in real time

Explore how topology affects performance
