# USS TJR - Medical Bay Master Scope

## Vision

Medical Bay is a personal health intelligence platform designed to help Captain TJR understand health trends, manage chronic pain, track recovery and wellness, maintain medical records, support specialist appointments, generate health intelligence, and build a long-term personal health history.

The long-term questions are:

- What was happening before things improved?
- What was happening before things worsened?

## Level 1 - Core Health Tracking

Purpose: daily health logging.

Capture:

- Pain: overall pain score, best pain today, worst pain today, pain location, and pain type.
- Mood: mood score, anxiety score, and stress score.
- Sleep: hours slept, sleep quality, and overnight wake-ups.
- Energy: energy score and fatigue score.
- Daily notes: observations, activities, triggers, wins, and challenges.

Pain types:

- Burning
- Sharp
- Ache
- Nerve
- Stiffness

## Level 2 - Condition Management

Track individual health conditions separately:

- Chronic pain: back pain, SIJ pain, hip pain, knee pain, nerve symptoms, and mobility impacts.
- Blood pressure: systolic, diastolic, pulse, time measured, and notes.
- Weight management: weight, waist measurement, and BMI trend.
- Sleep apnoea: CPAP usage, hours worn, compliance percentage, and sleep quality.

## Level 3 - Medication Centre

Monitor medication effectiveness.

Medication profile:

- Medication name
- Dose
- Frequency
- Prescribing doctor
- Start date

Daily tracking:

- Taken
- Missed
- Delayed
- Side effects

Example future queries:

- Show pain levels on days Tramadol was taken.
- Compare sleep quality before and after medication changes.

## Level 4 - Medical History Vault

Create a permanent health timeline for diagnoses, surgeries, hospital admissions, ICU stays, infections, specialist reviews, procedures, injection therapies, and significant health milestones.

Timeline view:

- Year
- Event
- Outcome
- Notes

## Level 5 - Medical Document Vault

Store medical records in folders:

- Imaging
- Bloodwork
- Specialist Letters
- Referrals
- Procedures
- Hospital Records
- Sleep Studies
- Medications

Example future queries:

- Summarise my latest MRI.
- Compare my last two CT scans.

## Level 6 - Specialist Dashboard

Manage healthcare providers and appointments.

Provider profile:

- Name
- Specialty
- Contact details
- Clinic details

Appointment tracking:

- Date
- Reason
- Recommendations
- Follow-up actions

## Level 7 - Analytics Engine

Identify patterns and trends:

- Sleep vs pain
- Stress vs pain
- Mood vs pain
- Exercise vs pain
- Weather vs pain
- Medication vs symptoms

Visualisations:

- Pain trends
- Mood trends
- Energy trends
- Blood pressure trends
- Weight trends
- Sleep trends

## Level 8 - AI Health Intelligence

Generate health insights such as a weekly health brief with trend summaries and specialist discussion points.

Example brief:

- Pain stable over 14 days
- Sleep improved
- Stress reduced
- Hip symptoms increasing
- Blood pressure trending higher

## Level 9 - Procedure & Recovery Tracker

Track recovery from procedures.

Procedure profile:

- Procedure name
- Date
- Specialist
- Hospital
- Expected recovery

Recovery tracking:

- Daily pain
- Mobility
- Function
- Medication use
- Milestones achieved

## Level 10 - Health Mission System

Turn health goals into missions.

Mission examples:

- Reduce pain: average pain below agreed target.
- Improve sleep: seven or more hours average.
- Reduce blood pressure: within agreed healthy range.
- Weight management: milestone-based weight goals.
- Increase mobility: defined movement goals.

Mission status:

- Planned
- Active
- At Risk
- Complete

## Future Integration

```text
Medical Bay
├── Health Logs
├── Conditions
├── Medications
├── Specialists
├── Documents
├── Procedures
├── Recovery Tracking
└── Health Missions
        │
        ▼
Computer Core
        │
        ▼
AI Health Intelligence Layer
```

Future queries:

- Show all pain flares during the past six months.
- What changed before my last improvement period?
- Generate a specialist appointment briefing.
- Build a timeline of all spinal procedures.
- Compare sleep quality with pain severity.
- Identify recurring triggers associated with pain increases.

## Recommended Build Order

Phase 1:

- Core Health Tracking
- Pain
- Mood
- Sleep
- Energy
- Notes
- Dashboard

Phase 2:

- Medication Centre
- Blood Pressure Tracking
- Weight Tracking
- CPAP Tracking

Phase 3:

- Medical History Vault
- Specialist Dashboard
- Procedure Tracking

Phase 4:

- Document Vault
- Upload and Storage
- Search and Retrieval

Phase 5:

- Analytics Engine
- Trend Detection
- Visualisations

Phase 6:

- AI Health Intelligence
- Weekly Health Brief
- Pattern Recognition
- Specialist Briefing Generator
