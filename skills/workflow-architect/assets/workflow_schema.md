# Workflow: [Name of Process]

**Trigger:** [Event that starts this, e.g., "Pull Request Created"]
**Goal:** [Definition of Done]
**Inputs:** 
- [Variable 1]
- [Variable 2]

---

## ⚡ Execution Flow

### Step 1: [Action Name]
- **Action**: [Command or specific instruction]
- **Verification**: [How do we know it worked?]
- **On Failure**: [Abort / Retry]

### Step 2: [Action Name]
- **Action**: ...
- **Input**: [Output from Step 1]

### 💎 Decision Gate A
- **Condition**: IF [Condition X] IS TRUE:
  - **Go To**: Step 3
- **Condition**: IF [Condition X] IS FALSE:
  - **Go To**: Step 4 (or Abort)

### Step 3: [Action Name]
...

---

## 📜 Output Artifacts
- [List of files or states changed]