Setup

1. Install dependencies:
   - `npm install`
   - `npx expo install`

2. Environment (optional for Google Vision):
   - Create `app.config.js` or use `app.json` with `extra` and add `EXPO_PUBLIC_USE_VISION` and `EXPO_PUBLIC_VISION_API_KEY` via your shell.
   - Example shell env:
     - `setx EXPO_PUBLIC_USE_VISION 1`
     - `setx EXPO_PUBLIC_VISION_API_KEY <YOUR_KEY>`

3. Run:
   - `npm run android` or `npm run web`


