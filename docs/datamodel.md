# USS TJR — Data Model

All data is stored in browser localStorage as JSON strings. There is no server, no database, and no external synchronisation. This document defines every storage key, its type, and its schema.

## Storage Keys

| Key | Type | Purpose |
|-----|------|---------|
| `usstjr-captains-log-draft` | Object | Current unsaved Captain's Log form state |
| `usstjr-latest-captains-log` | Object | Most recently saved Captain's Log (drives Command Deck display) |
| `usstjr-captains-log-history` | Array | All saved Captain's Logs (max 20, sorted newest-first) |
| `usstjr-medical-bay-draft` | Object | Current unsaved Medical Bay form state |
| `usstjr-medical-bay-history` | Array | All saved health logs (max 30, sorted newest-first) |
| `usstjr-stardate-YYMMDD` | Number | Daily sequence counter; one key per calendar date used |

Key naming follows the prefix convention defined in `js/core/constants.js`.

---

## Captain's Log

A Captain's Log entry records one day of personal metrics and reflections.

### Draft Schema (`usstjr-captains-log-draft`)

The draft is a flat object written on every form input event. It mirrors the form field IDs directly.

```json
{
  "logDate": "2025-06-04",
  "stardate": "250604.1",
  "mood": "8",
  "energy": "7",
  "pain": "3",
  "stress": "4",
  "wins": "Completed the documentation audit.",
  "challenges": "Staying focused.",
  "lessons": "Small steps compound.",
  "gratitude": "Good weather.",
  "healthUpdate": "Pain manageable today.",
  "careerUpdate": "Made progress on USS TJR.",
  "tjrMindBody": "Meditated for 10 minutes.",
  "voiceCapture": "Dictated a quick summary.",
  "priority1": "Finish docs",
  "priority2": "Review backlog",
  "priority3": ""
}
```

### Saved Entry Schema (`usstjr-captains-log-history` item)

```json
{
  "id": "20250604-250604.1",
  "stardate": "250604.1",
  "logDate": "2025-06-04",
  "mood": 8,
  "energy": 7,
  "pain": 3,
  "stress": 4,
  "wins": "Completed the documentation audit.",
  "challenges": "Staying focused.",
  "lessons": "Small steps compound.",
  "gratitude": "Good weather.",
  "healthUpdate": "Pain manageable today.",
  "careerUpdate": "Made progress on USS TJR.",
  "tjrMindBody": "Meditated for 10 minutes.",
  "voiceCapture": "Dictated a quick summary.",
  "priority1": "Finish docs",
  "priority2": "Review backlog",
  "priority3": "",
  "createdAt": "2025-06-04T10:30:00.000Z",
  "updatedAt": "2025-06-04T10:30:00.000Z"
}
```

**History constraints:**
- Maximum 20 entries. When the limit is reached, the oldest entry is removed.
- Sorted by `logDate` descending (newest first).
- Entry IDs are `YYYYMMDD-STARDATE` format (e.g. `20250604-250604.1`).

### Latest Entry Schema (`usstjr-latest-captains-log`)

Identical to a saved history entry. Written on every save so the Command Deck always reflects the most recent log without searching history.

---

## Medical Bay

A Medical Bay entry records one day of health metrics including pain, sleep, CPAP compliance, and wellbeing scores.

### Draft Schema (`usstjr-medical-bay-draft`)

Flat object mirroring Medical Bay form field IDs.

```json
{
  "medicalDate": "2025-06-04",
  "painOverall": "4",
  "painBest": "2",
  "painWorst": "7",
  "painLocation": "Lower back",
  "painTypes": ["aching", "burning"],
  "mood": "7",
  "anxiety": "3",
  "stress": "4",
  "sleepHours": "7.5",
  "sleepQuality": "7",
  "sleepWakeups": "1",
  "energyMorning": "6",
  "energyAfternoon": "7",
  "fatigue": "4",
  "cpapUsed": "yes",
  "cpapMyAirScore": "92",
  "cpapUsageHours": "7.2",
  "cpapMaskSeal": "95",
  "cpapAhi": "2.1",
  "cpapMaskOff": "0",
  "cpapHumidity": "3",
  "cpapPressure": "auto",
  "observations": "Pain spike in the afternoon.",
  "activities": "Short walk.",
  "triggers": "Sitting too long.",
  "wins": "Managed pain without medication.",
  "challenges": "Low afternoon energy."
}
```

### Saved Entry Schema (`usstjr-medical-bay-history` item)

```json
{
  "id": "20250604",
  "medicalDate": "2025-06-04",
  "painOverall": 4,
  "painBest": 2,
  "painWorst": 7,
  "painLocation": "Lower back",
  "painTypes": ["aching", "burning"],
  "mood": 7,
  "anxiety": 3,
  "stress": 4,
  "sleepHours": 7.5,
  "sleepQuality": 7,
  "sleepWakeups": 1,
  "energyMorning": 6,
  "energyAfternoon": 7,
  "fatigue": 4,
  "cpap": {
    "used": true,
    "myAirScore": 92,
    "usageHours": 7.2,
    "maskSeal": 95,
    "ahi": 2.1,
    "maskOff": 0,
    "humidity": 3,
    "pressure": "auto"
  },
  "observations": "Pain spike in the afternoon.",
  "activities": "Short walk.",
  "triggers": "Sitting too long.",
  "wins": "Managed pain without medication.",
  "challenges": "Low afternoon energy.",
  "createdAt": "2025-06-04T20:00:00.000Z",
  "updatedAt": "2025-06-04T20:00:00.000Z"
}
```

**History constraints:**
- Maximum 30 entries. Oldest entry removed when limit exceeded.
- Sorted by `medicalDate` descending.

---

## Stardate System

Stardates provide a consistent, sortable identifier for each log entry.

### Format

```
YYMMDD.N
```

- `YY` — two-digit year (e.g. `25` for 2025)
- `MM` — two-digit month (e.g. `06`)
- `DD` — two-digit day (e.g. `04`)
- `N`  — sequence number starting at `1`, incrementing if multiple logs exist for the same date

Examples: `250604.1`, `250604.2`, `251231.1`

### Counter Storage

Each calendar date that has at least one log gets its own localStorage key:

```
usstjr-stardate-250604  →  1
```

The counter is read before generating a new stardate and advanced immediately after a successful save. This prevents duplicate stardates if the user saves multiple logs on the same day.

---

## Backup Structure

A backup is a JSON object that captures the complete application state at a point in time. It is produced by `js/modules/backup.js`.

### Plain Backup Schema

```json
{
  "version": "v1",
  "exportDate": "2025-06-04T10:30:00.000Z",
  "captainsLog": {
    "draft": { /* Captain's Log draft object */ },
    "latestEntry": { /* latest saved entry */ },
    "history": [ /* array of saved entries */ ]
  },
  "medicalBay": {
    "draft": { /* Medical Bay draft object */ },
    "history": [ /* array of saved entries */ ]
  },
  "stardateCounters": {
    "usstjr-stardate-250604": 1,
    "usstjr-stardate-250603": 2
  }
}
```

### Encrypted Backup Schema

The encrypted backup wraps the plain backup payload in an AES-GCM envelope:

```json
{
  "version": "v1",
  "encrypted": true,
  "exportDate": "2025-06-04T10:30:00.000Z",
  "iv": "<base64-encoded 12-byte IV>",
  "salt": "<base64-encoded 16-byte salt>",
  "data": "<base64-encoded AES-GCM ciphertext>"
}
```

**Encryption details:**
- Algorithm: AES-GCM with a 256-bit key
- Key derivation: PBKDF2 with SHA-256, 100,000 iterations
- IV: 12 random bytes, unique per export
- Salt: 16 random bytes, unique per export
- Implementation: browser Web Crypto API (`SubtleCrypto`)

---

## Future Extensions

As Medical Bay grows through its planned phases, the data model will expand. Anticipated additions:

| Phase | New Data |
|-------|----------|
| Phase 2 — Condition Management | `conditions[]` — chronic condition tracking |
| Phase 3 — Medication Centre | `medications[]` — medication log with dose and timing |
| Phase 4 — Medical History Vault | `appointments[]`, `procedures[]` |
| Phase 5 — Document Vault | Encrypted document metadata and references |
| Phase 8 — Intelligence Layer | Derived metrics, trend summaries (read-only computed data) |

All future schemas should follow the same conventions:
- Flat structure where practical
- ISO 8601 dates (`YYYY-MM-DD` or full timestamp)
- `createdAt` / `updatedAt` on every saved entry
- Prefixed localStorage keys (`usstjr-*`)
- Numeric scores as numbers, not strings, after parsing
