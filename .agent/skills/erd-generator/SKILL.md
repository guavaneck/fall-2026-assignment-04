---
name: erd-generator
description: Design and render a verified Mermaid entity-relationship diagram when asked for an ERD, data model, database schema, or architecture diagram.
---

# ERD Generator

Turn the user's domain requirements into a Mermaid `erDiagram` and a compiled SVG.

## Workflow

1. Resolve ambiguities with explicit, conservative business rules. Identify entities, attributes, primary keys (`PK`), foreign keys (`FK`), optionality, and relationship cardinalities.
2. Use snake_case attribute names and Mermaid-supported scalar type names. Write the diagram to `docs/architecture/schema.mmd`, creating the directory when needed.
3. From the repository root, run:

   ```bash
   node .agent/skills/erd-generator/scripts/render_erd.js docs/architecture/schema.mmd
   ```

4. If output starts with `SYNTAX_ERROR:`, use the diagnostic to correct `schema.mmd` and rerun the command. Make at most three correction attempts. If all fail, report the final error and leave the latest source intact for inspection.
5. On success, present the final raw Mermaid block and point the user to `docs/architecture/erd.svg`.

Do not claim completion unless the renderer prints `SUCCESS` and exits with status 0.
