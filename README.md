# Pip's Midnight Observatory 🌙

Meet Pip, the Junior Dream Engineer of a tiny midnight nursery. Explore a whimsical world of story scenes, starlit projects, lullabies, and little dreams waiting to be delivered.

**Live demo:** [pips-midnight-observatory-lxas.vercel.app](https://pips-midnight-observatory-lxas.vercel.app/)

**Source repository:** [github.com/sandhya-s11/pips-midnight-observatory](https://github.com/sandhya-s11/pips-midnight-observatory)

## Explore the observatory ✨

- **Meet Pip:** Say hello to the interactive character and switch between Sleepy and Curious moods.
- **Story scenes:** Follow Pip’s origin story, find hidden stars, and uncover a secret portal.
- **Dream Workshop:** Open the four glowing projects: Lullaby Lab, Nightlight Collection, Dream Delivery Routes, and The Magic Cabinet.
- **Magic Cabinet:** Search for hidden stars, play Catch a Dream, browse dream wishes, and discover the cabinet’s day/night drawer.
- **Nightlight Garden:** Light Pip’s lantern, find collectibles, and reveal little messages.
- **Dream Delivery Routes:** Choose among four destinations and watch Pip travel along the animated map.
- **Interactive storybook:** Turn through Pip’s story with its page controls; the book also supports swiping and arrow-key navigation.
- **Dreamland Gate:** Generate a bedtime wish, interact with Pip, and see the Dreams Delivered odometer update. Its counter is a local demo count, not live visitor data.
- **Sound and themes:** Use the shared sound toggle and switch between the persisted Day and Night themes. Chaos Mode adds optional decorative effects.

## Built with

- React 19 and JavaScript (ES modules)
- Vite for the development server and production build
- CSS for layout, themes, animation, and responsive styling
- Browser APIs used by the app include local/session storage, Web Audio, audio playback, and speech synthesis where supported

There is no separate routing or component library listed in the project dependencies.

## Project structure

```text
.
├── public/
│   ├── audio/             # Bundled music, voice, and sound-effect files
│   ├── images/            # Character artwork, backgrounds, and decorative assets
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── App.jsx            # Main page, themes, sections, and project experiences
│   ├── App.css
│   ├── DreamlandGate.jsx  # Final scene and local dream counter
│   ├── DreamlandGate.css
│   ├── MagicCabinet.jsx
│   ├── MagicCabinet.css
│   ├── MidnightStorybook.jsx
│   ├── MidnightStorybook.css
│   ├── StardustCursor.jsx
│   ├── StardustCursor.css
│   ├── index.css
│   └── main.jsx           # React application entry point
├── index.html
├── package.json
├── package-lock.json
├── eslint.config.js
└── vite.config.js
```

## Run locally

### Prerequisites

- Node.js and npm installed
- Git, to clone the repository

### Setup

```bash
git clone https://github.com/sandhya-s11/pips-midnight-observatory.git
cd pips-midnight-observatory
npm install
npm run dev
```

Open the local URL printed by Vite in your browser. To create a production build, run:

```bash
npm run build
```

`npm run lint` runs ESLint. `npm run preview` serves the production build locally after building.

## How to explore

Use the top navigation to visit About Pip, Dream Workshop, Pip’s Story, and the storybook. In the Workshop, select a glowing bulb to open a project; use its **Back to Workshop** control to return. Try the cabinet drawers, collect the hidden stars, and use the storybook’s page controls or supported swipe/keyboard inputs. The global sound button controls app-managed audio; browser audio may require an explicit interaction before playback. The Day/Night button changes the site theme, and Chaos Mode can be switched off whenever you like.

## Credits and attribution

- The app credits Pip’s character artwork to the **official haX.baby Pip asset pack**. The repository also contains bundled image, audio, and decorative assets; they are not presented here as original assets. Refer to their respective creators and terms for reuse rights.
- Development assistance included **ChatGPT** and **Cursor AI**. This acknowledges tooling assistance and does not claim that the tools created or own the artwork or audio.
- Fonts are loaded from Google Fonts: DM Mono, DM Sans, and Fraunces.
