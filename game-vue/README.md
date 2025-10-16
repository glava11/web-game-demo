# Quicky Finger - Real-Time Multiplayer Precision Game

A high-performance, real-time multiplayer game built with modern web technologies. Stop the slider as close to center as possible and compete on a global leaderboard!

![Quicky Finger Demo](./docs/demo.gif)

**Live Demo:** [https://quick-finger.vercel.app](https://quick-finger.vercel.app)

---

## Features

- **Instant Play** - No signup required, jump right in
- **Real-Time Multiplayer** - See scores update live across all players
- **Smart UX** - Only prompts for nickname if you achieve a top score
- **60fps Animation** - Smooth gameplay using requestAnimationFrame
- **Visual Feedback** - Confetti celebrations for great scores
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Type-Safe** - Full TypeScript implementation
- **Tested** - 60+ tests covering all functionality

---

## Architecture

```
┌─────────────────────────────────────────┐
│         Vue 3 Frontend (Vite)            │
│  ┌────────────────────────────────────┐ │
│  │  Components (Composition API)       │ │
│  │  - SliderGame                       │ │
│  │  - Leaderboard                      │ │
│  │  - NicknameInput                    │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  State Management (Pinia)           │ │
│  │  - gameStore                        │ │
│  │  - leaderboardStore                 │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Composables                        │ │
│  │  - useWebSocket                     │ │
│  │  - useGameLoop                      │ │
│  └────────────────────────────────────┘ │
└─────────────┬───────────────────────────┘
              │ WebSocket (wss://)
              ▼
┌─────────────────────────────────────────┐
│      Node.js WebSocket Server            │
│  ┌────────────────────────────────────┐ │
│  │  - Real-time score broadcasting     │ │
│  │  - Input validation & sanitization  │ │
│  │  - Rate limiting (10 req/10s)       │ │
│  │  - In-memory leaderboard            │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/quicky-finger.git
cd quicky-finger

# Install frontend dependencies
cd game-vue
npm install

# Install server dependencies
cd ../ws-server
npm install
```

### Running Locally

**Terminal 1 - Start Server:**

```bash
cd ws-server
npm run dev
```

**Terminal 2 - Start Frontend:**

```bash
cd game-vue
npm run dev
```

Open http://localhost:5173 and play!

---

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test suite
npm test integration
npm test performance
```

**Test Coverage:**

- Unit tests: Game logic, scoring, utilities
- Component tests: User interactions, rendering
- Integration tests: WebSocket flow, state management
- Performance tests: 60fps compliance, memory management

---

## Deployment

### Frontend ()

```bash
cd game-vue
...

```

### Backend ()

1. Push code to GitHub
2. Go to [xy](https://xy)
3. Deploy from GitHub
4. Set environment variable: `PORT=8080`

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

---

## Tech Stack

### Frontend

- **Vue 3** - Composition API
- **TypeScript** - Type safety
- **Pinia** - State management
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Vitest** - Testing
- **canvas-confetti** - Celebrations

### Backend

- **Node.js** - Runtime
- **ws** - WebSocket library
- **TypeScript** - Type safety

### DevOps

- **Vercel** - Frontend hosting
- **Railway** - Backend hosting
- **GitHub Actions** - CI/CD

---

## Performance

- **Load Time:** < 2s (Lighthouse)
- **Frame Rate:** Consistent 60fps
- **Bundle Size:** < 150KB (gzipped)
- **Time to Interactive:** < 3s
- **WebSocket Latency:** < 50ms average

---

## How to Play

1. **Click Start** - Slider begins moving left to right
2. **Watch Carefully** - Track the slider position
3. **Click STOP!** - Freeze the slider as close to center as possible
4. **See Your Score** - Closer to center = higher score (max 1000)
5. **Enter Nickname** - If you score in top 20, save your score!
6. **Compete** - Try to beat other players on the leaderboard

**Scoring:**

- Perfect center (50%) = 1000 points
- Every 1% away from center = -20 points
- Minimum score = 0 points

---

## Roadmap

### Phase 3: React Port

- [ ] Rebuild game in React
- [ ] Compare patterns (hooks vs composables)
- [ ] Multi-framework leaderboard

### Phase 4: Angular Port

- [ ] Complete the framework trilogy
- [ ] Document comparison insights

### Phase 5: Polish

- [x] Confetti celebrations
- [x] Sound effects
- [ ] Difficulty levels
- [ ] Dark/light theme
- [ ] Mobile optimization
- [ ] PWA support
- [ ] server saving the leaderboards data (and loading if any, on boot up)

---

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System design and decisions
- [API Protocol](./docs/API.md) - WebSocket message format
- [Development](../../development_doc.md) - Technical decisions
- [Learning](../../learning_doc.md) - Process and insights
- [Project structure](../../project_structure.md) - Project structure

---

## Contributing

This is a personal learning project, but feedback is welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## License

MIT License - feel free to use this code for learning!

---

## Author

**Drazen**

- Portfolio: [yoursite.com](https://yoursite.com)
- LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
- GitHub: [@yourusername](https://github.com/yourusername)

---

## Acknowledgments

- Built as part of interview preparation
- Inspired by classic arcade games
- Thanks to the Vue, React, and Angular communities

---

**Built with ❤️ and lots of ☕**
