# Third-party skill: seo-geo-aeo

Installed unmodified from https://github.com/SNLabat/SEO-GEO-AEO-Skill
(commit `a2c8769b85813912b2b01cd12c3484f061b439fc`, installed 2026-09-30), by Alex Labat.

Notes
- The repository publishes no license file. It is installed here as project knowledge for our own use; check with the author
  before redistributing it or publishing this repository.
- It is a website *audit* skill (crawl a URL, score SEO/GEO/AEO, produce a Word/PDF report), not a writing skill. Its report
  step needs `docx` tooling that is not part of this project. The blog uses it as the rubric: see `lib/blog/seo.ts`, which turns
  the skill's signals into the writing playbook, the generation checks and the publish-gate warnings.
- Do not edit the installed files in place; re-install from upstream to update.
