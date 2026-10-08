# HE3AM Music Hub 🎵

A local-first playlist manager built with Flutter. No Spotify, SoundCloud, Base44, or account required.

## Included
- Multiple playlists
- Add/edit/delete songs
- Bulk import `Artist - Song`
- Search by artist/title/tags
- Favorites and tags
- Drag-and-drop reordering
- Optional external music link
- JSON backup/restore
- Light/dark mode
- Local persistence

## Run
Install Flutter 3.x, then:

```bash
flutter pub get
flutter run -d chrome
# or
flutter run -d windows
# or
flutter run -d android
```

## Build
```bash
flutter build web
flutter build windows
flutter build apk --release
```

The project is intentionally local-first: it does not connect to Spotify or SoundCloud and does not require Base44.
