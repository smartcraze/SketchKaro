<img width="1666" height="862" alt="image" src="https://github.com/user-attachments/assets/8060a893-a431-49a7-8a7d-681bf3d08cf2" />
# ✨ Sketch Karo — Real-time Collaborative Whiteboard

> Built with **Next.js**, **Turborepo**, **Canvas**, **WebSocket**, and **ShadCN UI**
> Create, Collaborate & Innovate — all in real-time.

## Architecture 



## 🚀 Features

* 🎨 Interactive whiteboard with pencil drawing
* 🤝 Real-time collaboration with WebSockets
* 🔐 JWT-based authentication (Sign In / Sign Up)
* 🖥️ Full canvas preview with room joining by slug
* 🌗 Dark/light mode toggle (ShadCN-powered)
* 📬 Email capture form and responsive footer
* 🔧 Built using **Turborepo** for modularity and speed

## 🧱 Tech Stack

* **Frontend:** React, Next.js, Tailwind CSS, ShadCN UI
* **Backend:** Node.js, Express, Socket
* **Auth:** JWT + Cookie-based session management
* **Canvas:** HTML5 Canvas API with freehand drawing
* **Monorepo:** Turborepo + Shared Configurations

## 🖥️ Demo

> 🔗 [Live Demo](https://sketchkaro.surajv.me)

Login, draw with friends in real-time, and watch as ideas come to life — all inside your browser.


## 💪 Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/smartcraze/sketchkaro

# 2. Move into the directory
cd sketchkaro

# 3. Install dependencies (Turborepo handles all workspaces)
bun install

# 4. Start dev environment
bun dev
```

🧠 Pro Tip: Use `bun build` to test production builds across the monorepo.


## 💡 Room Flow

* Authenticated users can create or join rooms via slug
* The backend ensures secure room creation & user tracking
* Frontend renders real-time drawing with multi-user presence


## 🔒 Auth Flow

* JWT stored in cookies
* Login state is reactive across components (Navbar, Hero, etc.)
* Protected routes and room access verification

## 📁 Project Structure

```
apps/
  web/                → Frontend (Next.js)
  http-backend/       → Express backend http
  ws-backend/         → Bun inbuilt Websocket

packages/
  ui/            → ShadCN components
  config/        → Tailwind + tsconfig + eslint
  db/            → backend Primsa
  common         → common zod schema
  backend-commom → backend common config

public/          → Static assets
```

---

## 🙌 Acknowledgements

* [ShadCN UI](https://ui.shadcn.com)
* [webSocket](https://bun.sh)
* [Turborepo](https://turbo.build)
* [Lucide Icons](https://lucide.dev)

Made with ❤️ by [Suraj Vishwakarma](https://twitter.com/surajv354)
