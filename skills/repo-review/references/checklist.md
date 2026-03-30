# Master Review Checklist

Use this as a quality gate before delivering the report.

---

## ✅ Phase 0 — Orientation
- [ ] Ran `orient.py` and have project snapshot
- [ ] Identified total file count and primary languages
- [ ] Chose review depth (quick / standard / deep) and justified it
- [ ] README read (if present)
- [ ] Git history checked (recent activity, contributors)

---

## ✅ Phase 1 — Structure
- [ ] Annotated directory tree produced
- [ ] Entry points identified (or noted as absent/unclear)
- [ ] Config files catalogued
- [ ] Test directories located
- [ ] Project structure pattern identified (MVC, layered, feature-based, etc.)

---

## ✅ Phase 2 — Tech Stack & Dependencies
- [ ] Primary language(s) confirmed
- [ ] Framework(s) identified
- [ ] Database(s) identified
- [ ] Dependency count noted (prod vs dev)
- [ ] Lock file present? (reproducible builds)
- [ ] Environment variables documented

---

## ✅ Phase 3 — Architecture
- [ ] Core data model located (schema / models)
- [ ] Main request/data flow traced
- [ ] Module boundaries mapped
- [ ] Cross-cutting concerns identified (auth, logging, errors, config)
- [ ] External integrations noted
- [ ] Architecture diagram or narrative written

---

## ✅ Phase 4 — Code Quality
- [ ] Test ratio calculated
- [ ] CI/CD presence checked
- [ ] Linter config presence checked
- [ ] Large files listed (>500 lines)
- [ ] TODO/FIXME count noted
- [ ] Documentation coverage estimated

---

## ✅ Phase 5 — Security
- [ ] Security scan run
- [ ] Critical findings reviewed
- [ ] Sensitive files checked
- [ ] .gitignore checked
- [ ] Hardcoded secrets scan complete
- [ ] Dangerous function calls flagged

---

## ✅ Phase 6 — Report
- [ ] Executive summary explains what the project does in 1–3 sentences
- [ ] Tech stack section complete
- [ ] Architecture section has actual content (not just placeholder)
- [ ] Directory guide annotated
- [ ] Key files listed with descriptions
- [ ] Security flags included with disclaimer
- [ ] Onboarding checklist is project-specific (not generic)
- [ ] Open questions filled in with real uncertainties found during review
- [ ] Report tone is informative, not judgmental

---

## ✅ Final Checks
- [ ] All ⚠️ placeholder notes replaced with real content
- [ ] File paths referenced in report are real paths that exist
- [ ] No hallucinated framework or dependency names
- [ ] Report length is appropriate for depth chosen
- [ ] Offered to answer follow-up questions

---

## Common Mistakes to Avoid

❌ **Don't** describe the file tree without interpreting it  
❌ **Don't** list all 200 dependencies — summarize and highlight notable ones  
❌ **Don't** copy-paste script output raw — synthesize it  
❌ **Don't** leave placeholder notes (`_Fill in here_`) in the final report  
❌ **Don't** make up file contents — if you haven't read a file, say so  
❌ **Don't** assume bad intent from security findings — explain and contextualize  
✅ **Do** read the actual key files, not just their names  
✅ **Do** note when something is unclear or worth further investigation  
✅ **Do** give concrete next steps, not vague recommendations
