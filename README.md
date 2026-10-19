# Radio Streaming Template

An independent Android-first Expo / React Native starter for a single live radio
station. No broadcaster, stream endpoint, account, credentials or recorded audio
is included. This project is not affiliated with any broadcaster.

## Start

Requires Node.js 22.13 or newer, npm, Android SDK/emulator and JDK 17 for local
Android builds. Run commands from this repository's root.

```powershell
npm.cmd ci
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
```

Edit `station.ts`: set your station name, tagline and a direct HTTPS audio stream
you are authorized to use. Until a URL is configured, Play is disabled and no
audio stream connection is made. Do not put passwords or secret tokens in this
file: all app configuration ships to users. A webpage URL is not an audio stream.

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\path\to\your\jdk-17"
npm.cmd run android
```

The layout, circular station graphic, play/pause button, reconnect-to-live behavior
and Android Back confirmation are included. Playback starts when Play is pressed.
No recording, rebroadcast proxy, advertising or analytics is implemented.

## Metadata and limitations

The config plugin patches **expo-audio 57.0.5** to expose ICY stream titles from
Android's Media3 player. Keep the exact pin and `buildFromSource` setting. Review
the plugin before upgrading. It changes dependency sources during prebuild, never
the generated app's Android files by hand.

Metadata requires an ICY-compatible source. Not every station, codec or HLS stream
provides it; missing metadata shows a fallback. The parser assumes
`Artist - Title` and supports `[+]` between artists; customize it for your source.
Album art lookup and programme APIs are not included. The native metadata bridge
requires an Android native build; Expo Go cannot load it. iOS and web are not
validated template targets. Autoplay and reliable background/lock-screen controls
are not implemented. Text scaling is capped at 1.3 for key labels to fit the screen.

## Build your own APK

1. Change the installed name, slug, icon and `android.package` in `app.json`.
   `com.example.radiotemplate` is a placeholder: choose your own package ID.
2. Sign into your own Expo account and initialize your own project:

```powershell
npx.cmd eas-cli@latest login
npx.cmd eas-cli@latest init
```

3. Run the checks above and build with the included APK profile:

```powershell
$env:EAS_NO_VCS = '1'
$env:EAS_PROJECT_ROOT = (Get-Location).Path
npx.cmd eas-cli@latest build --platform android --profile apk
```

Download from the completed build page. Preserve your signing key and increment
`android.versionCode` for future updates. Generated native folders, APKs, local
environment files and signing secrets are ignored by Git.

## Rights and licenses

The code is MIT licensed; see `LICENSE` and `THIRD_PARTY_NOTICES.md`. That license
does **not** grant rights to a station's stream, music, metadata, artwork or marks.
Public accessibility and educational use do not by themselves establish permission.
Use your own or appropriately licensed content and branding, and check the source
provider's terms before distribution. Adding a disclaimer does not grant rights.

No official station logo or artist artwork is supplied. The icons are unchanged
Expo starter placeholders; replace them with your own before releasing an app.
The template does not copy or distribute any broadcaster application code.

## Security status

This is a starter, not an audited production service. A scoped `uuid` override
reduced the 2026-10-19 audit from 22 findings to 15 high findings. The remaining
entries trace to two upstream advisories without published patched versions.
See [SECURITY.md](SECURITY.md) for versions, dependency paths, precautions and
recheck commands. These are not all proven runtime APK issues. Avoid
`npm audit fix --force`: suggested major downgrades can break the Expo SDK and
native metadata extension. APK/native dependency license review is separate
from publishing source code.
