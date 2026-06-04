# Feature: Captain's Log

**Page:** `captains-log.html`
**Module:** `js/modules/captains-log.js`

## Purpose

The Captain's Log is the daily personal log. It captures four numerical wellness metrics and a set of structured reflections. Entries are stored locally and can be exported as readable markdown documents.

## User Workflow

### Creating a new log

1. Navigate to Captain's Log from the Command Deck.
2. The date defaults to today and the stardate is generated automatically.
3. Fill in the four metric fields (0–10 scale): Mood, Energy, Pain, Stress.
4. Fill in one or more text reflection fields: Today's Wins, Challenges, Lessons Learned, Gratitude.
5. Optionally fill in: Health Update, Career Update, TJR Mind Body.
6. Optionally use Voice Capture to dictate content.
7. Set up to three Tomorrow's Priorities.
8. Click **Save** to store the log. The Command Deck metrics update immediately.
9. Optionally click **Generate Log** to preview the markdown, then **Copy** or **Download Markdown**.

### Viewing a previous log

1. On the Command Deck, click any entry in the Recent Logs list.
2. The URL changes to include the log's ID as a query parameter.
3. Captain's Log loads and populates the form with the historical entry.
4. The entry is read-only in this view; it cannot be overwritten via Save (Save creates a new entry).

### Resetting the form

1. Click **Reset Form**.
2. Confirm the action in the confirmation modal.
3. The form clears and the draft is deleted.

## Data Captured

| Field | Type | Scale / Format |
|-------|------|----------------|
| Log Date | Date | `YYYY-MM-DD` |
| Stardate | Text | `YYMMDD.N` |
| Mood | Number | 0–10 |
| Energy | Number | 0–10 |
| Pain | Number | 0–10 |
| Stress | Number | 0–10 |
| Today's Wins | Text | Free-form |
| Challenges | Text | Free-form |
| Lessons Learned | Text | Free-form |
| Gratitude | Text | Free-form |
| Health Update | Text | Free-form |
| Career Update | Text | Free-form |
| TJR Mind Body | Text | Free-form |
| Voice Capture | Text | Appended from dictation |
| Priority 1–3 | Text | Free-form |

## Draft Auto-Save

The form auto-saves to `usstjr-captains-log-draft` on every input event. If the page is closed before saving, the draft is restored automatically on the next visit.

## Stardate Automation

When the user changes the Log Date field, the stardate recalculates immediately using the existing sequence counter for that date. This ensures that manually setting a past date produces a consistent stardate.

## Voice Capture

If the browser supports the Web Speech API, the microphone button activates continuous speech recognition in Australian English (`en-AU`). Transcribed text is appended to the Voice Capture field. If the browser does not support the API, the microphone controls are hidden.

See `js/modules/voice-capture.js` for implementation details.

## Markdown Output Format

The generated markdown includes:
- A header with the stardate and date
- Metric summary table
- Sections for each reflection field
- Tomorrow's priorities list

This format is designed to be human-readable when saved as a `.md` file.

## Dependencies

- `js/core/constants.js` — field definitions and storage keys
- `js/core/dates.js` — stardate generation and date formatting
- `js/core/dom.js` — form field access and download trigger
- `js/core/status.js` — save/error status messages
- `js/core/storage.js` — draft and history persistence
- `js/modules/command-deck.js` — syncing latest entry to Command Deck
- `js/modules/confirm-modal.js` — reset confirmation
- `js/modules/voice-capture.js` — dictation integration

## Future Roadmap

- Weekly summary: auto-generated average metrics for the past 7 days
- Log tags for categorisation and filtering
- Richer markdown preview (rendered HTML in the page)
- Import individual logs from external markdown files
- Date-range and metric-threshold search filters
