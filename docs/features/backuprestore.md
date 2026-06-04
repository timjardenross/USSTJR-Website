# Feature: Backup & Restore

**Page:** `index.html` (Command Deck)
**Module:** `js/modules/backup.js`

## Purpose

The Backup & Restore feature allows users to export their complete application data, store it safely outside the browser, and restore it later. This is the primary mechanism for protecting against data loss from browser cache clears, device changes, and accidental deletions.

Two export formats are available: plain JSON for portability and readability, and AES-GCM encrypted JSON for protected offsite storage.

## User Workflow

### Exporting a plain backup

1. Go to the Command Deck.
2. In the Backup section, click **Export Backup**.
3. The browser downloads a `.json` file containing all application data.
4. Store the file in a safe location (cloud storage, external drive, email to self).

### Importing a plain backup

1. Go to the Command Deck.
2. In the Backup section, click **Import Backup**.
3. Select the previously exported `.json` file.
4. Confirm the import in the confirmation modal.
5. All application data is replaced with the backup contents.
6. Verify the restoration by checking the Captain's Log and Medical Bay histories.

### Exporting an encrypted backup

1. Go to the Command Deck.
2. Click **Export Encrypted Backup**.
3. Enter a passphrase when prompted. **Remember this passphrase — it is not stored anywhere.**
4. The browser downloads a `.enc.json` file containing the encrypted backup.
5. Store the file in a safe location. The file is unreadable without the passphrase.

### Importing an encrypted backup

1. Go to the Command Deck.
2. Click **Import Encrypted Backup**.
3. Select the `.enc.json` file.
4. Enter the passphrase used when the backup was created.
5. Confirm the import.
6. All application data is replaced.

## What the Backup Contains

A backup includes all application data:

- Captain's Log draft (unsaved form state)
- Captain's Log latest entry (Command Deck display data)
- Captain's Log history (up to 20 entries)
- Medical Bay draft (unsaved form state)
- Medical Bay history (up to 30 entries)
- All stardate counters (one per calendar date used)

See [data-model.md](../data-model.md) for the full backup schema.

## Encryption Details

Encrypted backups use the browser's native Web Crypto API (`SubtleCrypto`). No external encryption library is used.

| Property | Value |
|----------|-------|
| Algorithm | AES-GCM |
| Key size | 256-bit |
| Key derivation | PBKDF2 with SHA-256 |
| PBKDF2 iterations | 100,000 |
| IV | 12 random bytes, unique per export |
| Salt | 16 random bytes, unique per export |

The passphrase is never stored. Without it, the backup cannot be decrypted.

**Browser requirement:** Encrypted backup requires `window.crypto.subtle` (Web Crypto API). This is available in all modern browsers over HTTPS. If the API is unavailable, the encrypted backup buttons are disabled and a message is shown.

## Data Safety Considerations

- **Plain backups** are human-readable. Anyone with the file can read all log data.
- **Encrypted backups** protect the content but require the passphrase for restoration.
- Backups are point-in-time snapshots. A backup does not capture changes made after it was exported.
- Importing a backup **overwrites** all current data. There is no merge. Export current data first if needed.
- There is no preview before import. The confirmation modal is the only safeguard.

## Recommended Backup Schedule

| Frequency | Action |
|-----------|--------|
| After every session | Export plain backup or encrypted backup |
| Weekly minimum | Export encrypted backup to offsite storage |
| Before any import | Export current data first as a safety copy |

## Dependencies

- `js/core/constants.js` — storage key prefixes, backup version
- `js/core/dom.js` — download file trigger
- `js/core/status.js` — success and error messages
- `js/core/storage.js` — reading all localStorage keys
- `js/modules/confirm-modal.js` — import confirmation

## Future Roadmap

- Restore preview: display a summary of the backup contents before confirming import
- Scheduled export reminder (e.g. prompt after 7 days without a backup)
- Backup validation report: check entry counts and date ranges before restoring
- Support for selective restore (e.g. restore Medical Bay history only)
