# MediaFlow — Universal Online Video & Music Search and Player

MediaFlow is a full-stack media discovery application and unified player built with React, TypeScript, Vite, Tailwind CSS, and Express. It enables users to search for songs, music, videos, podcasts, and audio tracks available online, with seamless switching between Video and Audio playback modes.

---

## 🌟 Key Features

1. **Universal Search Engine:**
   - Search by song title, singer/artist, album, video title, or podcast.
   - Live autocomplete suggestions and recent search history.
   - Filters for **All Media**, **Music**, **Videos**, **Podcasts**, and **Direct Audio**.
   - Direct YouTube URL or Video ID recognition and instant playback.

2. **Genuine YouTube Integration:**
   - Official **YouTube Data API v3** search integration returning titles, thumbnails, channel metadata, and durations.
   - Official **YouTube IFrame Player API** embedded player for authorized playback.
   - Full player controls (Play/Pause, seek, volume, next/previous).
   - Adheres to YouTube terms of service and player display requirements.

3. **Critical Feature: Video Mode & Audio Mode:**
   - **Video Mode:** Embedded visual player with video display and responsive viewport.
   - **Audio Mode:** Artwork-centric listening interface prioritizing album art, track details, and playback controls.
   - **Honest YouTube Handling:** In accordance with official YouTube API requirements, background or raw audio extraction without video is not permitted. When Audio Mode is selected on a YouTube item, MediaFlow embeds the authorized player with an artwork-focused layout while informing the user with clear notices.

4. **Authorized Direct Audio Playback (HTML5 Audio):**
   - Direct streaming audio for public-domain and Creative Commons content from the **Internet Archive** and **Wikimedia Commons**.
   - Native HTML5 Audio API controls for scrubbing, volume, buffer, and track navigation.

5. **Unified Player & Queue Management:**
   - Persistent bottom player bar across all page navigation.
   - Expanded player modal with playback speed controls (0.75x to 2x), source attribution, and queue inspection.
   - Full queue management: Play Next, Add to Queue, Remove, Shuffle, Repeat (Off, All, One).
   - Coordinated playback authority: Ensures YouTube and direct HTML5 audio never play concurrently.

6. **Playlists, Favorites & History:**
   - Create, rename, and delete playlists with local storage persistence.
   - Heart favorites with filter by audio/video type.
   - Playback activity history with timestamps and one-click resume.

7. **Offline Media Downloads:**
   - **Authorized Direct Downloads:** Instant, one-click downloading of MP3 audio and MP4 video tracks from open catalogs (**Internet Archive** & **Wikimedia Commons**) via a secure backend proxy (`/api/download`) that ensures proper filenames and `Content-Disposition: attachment`.
   - **TOS & Licensing Transparency:** For YouTube media, provides clear and honest compliance guidance explaining that direct stream extraction is prohibited under YouTube Terms of Service, along with direct options to open in YouTube or find corresponding open-access tracks.
   - **Downloads Management Dialog:** Accessible from cards, the bottom player, the expanded player, and the sidebar, with a history tab of downloaded tracks saved in localStorage.

8. **Design & Usability:**
   - Modern dark slate theme with optional light theme.
   - Zero-pill metadata discipline with unboxed text and clean typographic separators.
   - Full keyboard navigation and accessible contrast.
   - Responsive layout for desktop (sidebar) and mobile (bottom navigation).

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or yarn

### Installation

1. Clone or extract the repository:
   ```bash
   git clone <repo-url>
   cd mediaflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Configure your optional YouTube API Key:
   ```env
   YOUTUBE_API_KEY="your_actual_google_cloud_youtube_api_key_here"
   ```

4. Run Development Server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Production Build:
   ```bash
   npm run build
   npm start
   ```

---

## 🔑 Google Cloud YouTube Data API v3 Setup Guide

To enable live YouTube search through your own Google Cloud project:

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Select an existing project or create a new project (e.g., `mediaflow-search`).
3. In the left sidebar, navigate to **APIs & Services > Library**.
4. Search for **YouTube Data API v3** and click **Enable**.
5. Navigate to **APIs & Services > Credentials**.
6. Click **+ CREATE CREDENTIALS** and select **API key**.
7. *(Recommended)* Click **Edit API key** to restrict the key:
   - Under **API restrictions**, choose **Restrict key** and select **YouTube Data API v3**.
8. Copy the generated key and add it to your `.env` file:
   ```env
   YOUTUBE_API_KEY="AIzaSy..."
   ```
9. Restart your server. Verify the status in the app under **Settings > YouTube Data API v3 Configuration**.

*Note:* If no API key is provided, MediaFlow automatically operates in Open Media Mode, querying Internet Archive and Wikimedia open catalogs, while still enabling embedded YouTube video playback via video URL or ID.

---

## 📋 Manual Testing Checklist

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open Homepage | Discover hero section, quick search chips, and curated music load. |
| 2 | Search "Atif Aslam" or "Beethoven" | Live suggestions appear; submitting displays normalized cards with title, creator, duration, and provider. |
| 3 | Click "Video" on YouTube item | Embedded YouTube player loads and plays with synchronized controls. |
| 4 | Click "Audio" on YouTube item | UI focuses on artwork and controls; honest compliance notice is displayed. |
| 5 | Click "Audio" on an Internet Archive item | Native HTML5 Audio plays real MP3 stream without YouTube iframe. |
| 6 | Scrub Seek Bar | Track position updates smoothly for both YouTube and direct audio. |
| 7 | Add item to Queue | Queue badge increments; drawer shows upcoming track with remove/play options. |
| 8 | Create Playlist & Add Item | Playlist persists in LocalStorage across page reloads. |
| 9 | Toggle Favorite | Track appears under Favorites page; heart icon updates. |
| 10 | Navigate between pages | Active playback continues in bottom bar without interruption. |

---

## ⚖️ Legal & Attribution Notice

- YouTube content is loaded solely through the official YouTube IFrame Player API v3. MediaFlow does not download, convert, extract, or redistribute YouTube media streams.
- Public domain and Creative Commons audio files are retrieved from the Internet Archive and Wikimedia Commons under their respective open licenses.
- No copyrighted streams are stored on the server.
