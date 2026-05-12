# Progress Tracker Schema

The `.wiki/progress.json` file persists digestion state across sessions. It is the single
source of truth for what has been processed, what is in progress, and what remains.

---

## Schema

```json
{
  "schema_version": 1,
  "last_updated": "YYYY-MM-DDTHH:MM:SS",
  "session_started": "YYYY-MM-DDTHH:MM:SS",

  "queue": [
    "filename-a.pdf",
    "filename-b.md"
  ],

  "current": {
    "filename": "filename-currently-in-processing.pdf",
    "moved_at": "YYYY-MM-DDTHH:MM:SS",
    "concepts_identified": ["Concept A", "Concept B"],
    "notes_created_so_far": ["Concept A"],
    "notes_updated_so_far": []
  },

  "completed": [
    {
      "filename": "finished-file.pdf",
      "completed_at": "YYYY-MM-DDTHH:MM:SS",
      "notes_created": ["Note A", "Note B"],
      "notes_updated": ["Note C"]
    }
  ],

  "wiki_stats": {
    "total_notes": 0,
    "draft_notes": 0,
    "complete_notes": 0,
    "total_sources_processed": 0
  }
}
```

---

## Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `schema_version` | int | Always `1` for now. Increment if schema changes. |
| `last_updated` | ISO datetime | Updated after every write. |
| `session_started` | ISO datetime | When the current ingestion session began. |
| `queue` | string[] | Filenames still in `raw/` waiting to be processed. Update after each scan. |
| `current` | object \| null | The file currently in `processing/`. `null` if nothing is in progress. |
| `current.filename` | string | Bare filename (not path). |
| `current.moved_at` | ISO datetime | When it was moved to `processing/`. |
| `current.concepts_identified` | string[] | All concepts found in this source. |
| `current.notes_created_so_far` | string[] | Notes already written for this source. |
| `current.notes_updated_so_far` | string[] | Existing notes already updated for this source. |
| `completed` | object[] | All files that have been moved to `processed/`. |
| `wiki_stats` | object | Running totals — update after each file completes. |

---

## Resume Logic

At session start:

```
1. Read .wiki/progress.json
2. If current != null:
     → A file was mid-processing when the last session ended.
     → Check: does processing/<filename> exist?
       YES → offer to resume: "I see <filename> was mid-processing. Resume from where we left off?"
              If yes: reload concepts_identified and skip already-created notes.
              If no (user wants fresh start): move file back to raw/, clear current, restart.
       NO  → the file may have already been moved manually. Check processed/. Update state.
3. If queue is stale (files in raw/ not in queue, or queue entries missing from raw/):
     → Rescan raw/ and reconcile. Warn user of any discrepancy.
4. Proceed with normal ingest workflow.
```

---

## Write Timing

Write `progress.json` at these moments (in order of importance):

1. **Before moving a file** to `processing/` — so a crash doesn't leave the file stranded
2. **After each note is created or updated** — so partial progress is saved
3. **After moving a file** to `processed/` — to record completion
4. **After updating wiki_stats** — to keep totals accurate

Never batch multiple operations before writing. Treat each write as a checkpoint.

---

## Empty Initial State

When no `.wiki/progress.json` exists yet, create it as:

```json
{
  "schema_version": 1,
  "last_updated": "<now>",
  "session_started": "<now>",
  "queue": [],
  "current": null,
  "completed": [],
  "wiki_stats": {
    "total_notes": 0,
    "draft_notes": 0,
    "complete_notes": 0,
    "total_sources_processed": 0
  }
}
```

Then scan `raw/` to populate `queue`.
