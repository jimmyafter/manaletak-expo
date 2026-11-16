# Mana Letak

Remember where you put things. Snap a photo, say where it goes, find it later. Expo (React Native) for Android and iOS.

## First run (on your computer)
```bash
npm install
npx expo install --fix     # aligns package versions to the installed Expo SDK
npm test                   # pure logic tests
npm run typecheck
npx expo start             # scan the QR code with Expo Go, or press a for Android
```
The camera needs a real phone (Expo Go) or an emulator with a camera. Save an item, then search it on Find.

## Push to GitHub (CI runs the tests for you)
```bash
git init -b main && git add . && git commit -m "Expo slice 1"
git remote add origin https://github.com/jimmyafter/manaletak.git
git push -u origin main
```
Keep the repo private. If the repo already has files, use `git pull --rebase origin main` first. On every push GitHub Actions runs tests, typecheck and a full Android bundle (see the Actions tab).

## Built in slice 1
Camera capture, Confirm form (item, place path, tags, sensitive), local SQLite with full-text search, Find with photo cards, Places by room, English/BM toggle, 40-item free cap.
Not yet: voice, AI fill-in, item detail/move, sign-in, backup, billing, onboarding, paywall (see SPEC.md).
