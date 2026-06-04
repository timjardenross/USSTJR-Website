# Feature: Medical Bay

**Page:** `medical-bay.html`
**Module:** `js/modules/medical-bay.js`

## Purpose

The Medical Bay is USS TJR's health intelligence platform. It captures detailed daily health metrics including pain tracking, sleep quality, mood, anxiety, energy levels, and CPAP compliance. It generates a structured health intelligence summary and maintains a searchable history of all health logs.

The Medical Bay is designed to grow through multiple phases. The current implementation is Phase 1 (Core Health Tracking). See [MEDICAL_BAY_SCOPE.md](../../MEDICAL_BAY_SCOPE.md) for the full 10-level vision.

## User Workflow

### Recording a daily health log

1. Navigate to Medical Bay from the Command Deck.
2. The date defaults to today.
3. Fill in the pain tracking section:
   - Overall pain (0–10)
   - Best pain of the day (0–10)
   - Worst pain of the day (0–10)
   - Pain location (free text)
   - Pain types (checkboxes: aching, burning, stabbing, throbbing, shooting, cramping, pressure, other)
4. Fill in wellbeing scores: Mood, Anxiety, Stress (all 0–10).
5. Fill in sleep metrics: Hours slept, Sleep quality (0–10), Wake-ups count.
6. Fill in energy scores: Morning energy, Afternoon energy, Fatigue level (all 0–10).
7. If applicable, fill in the CPAP compliance section.
8. Fill in the daily notes: Observations, Activities, Triggers, Wins, Challenges.
9. Click **Save Health Log**.
10. Optionally click **Generate Health Intelligence** and then **Download Markdown**.

### Viewing the health status panel

The top of the Medical Bay page displays:
- The date of the most recent health log
- The latest values for Pain, Sleep Quality, Energy, and Stress
- The latest CPAP compliance metrics (8 fields)

These update automatically when a new log is saved.

### Resetting the form

1. Click **Reset Form**.
2. Confirm the action in the confirmation modal.
3. The form clears and the Medical Bay draft is deleted.

## Data Captured

### Pain Tracking

| Field | Type | Scale / Format |
|-------|------|----------------|
| Overall Pain | Number | 0–10 |
| Best Pain | Number | 0–10 |
| Worst Pain | Number | 0–10 |
| Pain Location | Text | Free-form |
| Pain Types | Array | Checkboxes (multi-select) |

**Pain type options:** aching, burning, stabbing, throbbing, shooting, cramping, pressure, other

### Wellbeing

| Field | Type | Scale |
|-------|------|-------|
| Mood | Number | 0–10 |
| Anxiety | Number | 0–10 |
| Stress | Number | 0–10 |

### Sleep

| Field | Type | Scale / Format |
|-------|------|----------------|
| Sleep Hours | Decimal | Hours (e.g. 7.5) |
| Sleep Quality | Number | 0–10 |
| Sleep Wake-ups | Number | Count |

### Energy

| Field | Type | Scale |
|-------|------|-------|
| Morning Energy | Number | 0–10 |
| Afternoon Energy | Number | 0–10 |
| Fatigue Level | Number | 0–10 |

### CPAP Compliance

| Field | Type | Notes |
|-------|------|-------|
| CPAP Used | Boolean | Yes/No |
| myAir Score | Number | 0–100 (ResMed myAir app score) |
| Usage Hours | Decimal | Hours of CPAP use |
| Mask Seal | Number | 0–100 (percentage) |
| AHI | Decimal | Apnoea-Hypopnoea Index events per hour |
| Mask-Off Count | Number | Number of times mask was removed |
| Humidity Level | Number | Device humidity setting |
| Pressure Setting | Text | Pressure value or "auto" |

### Daily Notes

| Field | Type |
|-------|------|
| Observations | Free text |
| Activities | Free text |
| Triggers | Free text |
| Wins | Free text |
| Challenges | Free text |

## Draft Auto-Save

The Medical Bay form auto-saves to `usstjr-medical-bay-draft` on every input event. If the page is closed before saving, the draft restores automatically on the next visit.

## Health Intelligence Output

Clicking **Generate Health Intelligence** produces a structured markdown summary including:
- Date and key metric scores
- Pain summary with location and types
- Sleep and energy analysis
- CPAP compliance summary (if CPAP was used)
- Daily observations, activities, triggers, wins, and challenges

This output is designed to be useful when shared with a healthcare provider or reviewed as part of a weekly health check.

## Dependencies

- `js/core/constants.js` — field definitions, pain type definitions, storage keys
- `js/core/dates.js` — date formatting
- `js/core/dom.js` — form field access and download trigger
- `js/core/status.js` — save/error status messages
- `js/core/storage.js` — draft and history persistence
- `js/modules/confirm-modal.js` — reset confirmation

## Future Roadmap (from MEDICAL_BAY_SCOPE.md)

| Phase | Feature |
|-------|---------|
| Phase 2 | Condition Management — track chronic conditions |
| Phase 3 | Medication Centre — daily medication log |
| Phase 4 | Medical History Vault — appointments and procedures |
| Phase 5 | Document Vault — encrypted medical documents |
| Phase 6 | Specialist Dashboard — specialist-specific views |
| Phase 7 | Analytics Engine — trend analysis and charts |
| Phase 8 | AI Health Intelligence — pattern detection |
| Phase 9 | Procedure & Recovery Tracker |
| Phase 10 | Health Mission System |
