# Workspace Scope

Treat this repository as a focused `nt/ar` website task.

## Allowed source scope

- Start every investigation at `nt/ar/index.html`.
- Follow local links from `nt/ar/index.html` recursively, including links from pages reached through those links.
- Include linked local dependencies needed to understand or change those pages, such as CSS, JavaScript, images, audio, fonts, and other media.
- Resolve relative links from the file that contains each link. A linked file outside `nt/ar` is in scope only when it is reachable from this traversal.
- External URLs are not part of the source scope unless the user explicitly asks to investigate them.

## Excluded source scope

- Do not inspect, modify, summarize, or use files that are not reachable from `nt/ar/index.html`.
- Do not treat the repository root `index.html`, other language folders, `ot`, `grammar`, `peshitta`, or unrelated site sections as context unless a reachable file links to them or the user explicitly requests them.
- Exclude development, obsolete, backup, archive, and alternate copies even if they are under `nt/ar`. In particular, ignore paths or filenames containing `-dev`, `old`, `backup`, `archive`, or similar legacy markers.
- Do not start from a chapter page, search the whole `nt/ar` tree, or broaden the page set without first establishing that the page is reachable from `nt/ar/index.html`.

## Change and validation rules

- Preserve the existing HTML, CSS, JavaScript, and asset conventions of the reachable site.
- Keep edits limited to the reachable source graph and its directly required linked assets.
- When validating a change, begin with the affected page and its links; do not run broad repository-wide cleanup or refactoring.
- If a requested change requires an excluded file, explain that it is outside the defined scope and ask the user to expand the scope explicitly.