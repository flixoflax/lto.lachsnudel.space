# 📻 LTO — SYNCHRONIZED RECEIVER

> **CASE FILE #4217-A**  
> Device constructed by contactee N. for F.  
> Purpose: Maintain psychic link through synchronized audio transmission

## DEVICE OVERVIEW

The LTO Synchronized Receiver allows two contactees to listen to the same podcast episode in perfect synchronization, regardless of physical distance. When one receiver pauses, skips, or changes episodes, the other receiver responds immediately.

F. monitors broadcasts from [LTO.DE](https://www.lto.de) — specifically "Die Rechtslage," a German legal podcast. The device ensures both contactees hear transmissions simultaneously. "We must hear it together," F. explained. "That's what they want."

## TECHNICAL SPECIFICATIONS

**CAPABILITIES:**

- ✅ Real-time playback synchronization
- ✅ Episode chapter navigation (synced)
- ✅ Episode description display
- ✅ Connection status monitoring
- ✅ Mobile-responsive tabloid interface
- ✅ Supports episodes with or without chapters

## INSTALLATION PROCEDURE

```bash
# Clone the device schematics
git clone [repository-url]
cd lto-receiver

# Install components
npm install

# Configure Supabase connection (quantum tunnel)
# Create .env file with:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## SUPABASE SETUP

The device requires a Supabase project for real-time synchronization:

1. Create a new Supabase project
2. Enable Realtime in your project settings
3. Add your credentials to `.env`
4. No database tables required — uses Realtime Broadcast only

## OPERATION MANUAL

```bash
# Activate the device
pnpm dev

# The receiver will begin listening for transmissions
# Open on both contactee devices
# Connection establishes automatically
```

## SHARED ROOM ID

Both receivers must use the same `ROOM_ID` to establish connection. Currently set to `"fils"` in `app.tsx`. Modify as needed for secure transmission channels.

## DEVICE ARCHITECTURE

```
src/
├── app.tsx                      # Main device controller
├── components/
│   ├── connection-status.tsx    # Link status indicator
│   ├── episode-list.tsx         # Available transmissions
│   └── podcast-player.tsx       # Playback synchronizer
└── lib/
    └── rss-parser.ts            # RSS feed decoder (with chapter support)
```

## SYNCHRONIZED FEATURES

**When Receiver A performs an action, Receiver B responds immediately:**

- ▶️ Play → Both devices play
- ⏸️ Pause → Both devices pause
- ⏭️ Seek → Both devices jump to same timestamp
- 📖 Select Chapter → Both devices jump to chapter start
- 🎵 Change Episode → Both devices load new episode

## CURRENT FEED

Device is configured to receive: `Die Rechtslage` podcast from LTO.DE

To monitor different transmissions, modify the `feedUrl` in `app.tsx`.

## KNOWN PHENOMENA

- Episodes without chapter data still function normally
- HTML descriptions are properly sanitized for display
- Mobile interface prevents horizontal scroll anomalies
- Connection indicator shows green when both receivers online

## MAINTENANCE LOG

```
[2024] — Initial device construction
[2025] — Chapter navigation added
[2025] — Episode descriptions implemented
[2025] — Mobile interface hardened
```

## TECHNICAL NOTES

The device uses Supabase Realtime's broadcast functionality to maintain synchronization. Each receiver has a unique client ID to prevent infinite feedback loops. Time drift beyond 2 seconds triggers automatic re-synchronization.

---

**FILED BY N. FOR F.**  
_"They want us linked. Even apart."_

**⚠️ DEVICE STATUS: ACTIVE**  
**📡 MONITORING FREQUENCY: LTO.DE**  
**🛸 LACHSNUDEL.SPACE — THE TRUTH IS DELICIOUS**
