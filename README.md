# Repro: AI-mode aria snapshots drop names that come from a visible descendant

**Affects:** `locator.ariaSnapshot({ mode: 'ai' })`, and so `npx playwright cli snapshot` and the MCP `browser_snapshot` tool, which use it.
**Version:** Playwright 1.64.1 (latest stable on 2026-10-30), Chromium and WebKit (identical). The same logic is on `main` (`packages/injected/src/ariaSnapshotDistiller.ts`, checked 2026-10-30).

## Symptom
When an element's accessible name comes from a **visible descendant** (an `aria-labelledby` heading inside a dialog/section/nav, a button inside a column header, a `<caption>` inside a table), the AI-mode snapshot prints the element **without its name**. The browser computes the name, `getByRole(role, { name })` finds the element, and `ariaSnapshot()` in default mode prints the name.

```
cli snapshot (AI mode)                 ariaSnapshot() (default mode)
- region [ref=e5]                      - region "Heading B"
- navigation [ref=e13]                 - navigation "Nav E"
- dialog [ref=e16]                     - dialog "Delete item?"
- columnheader [ref=e22]               - columnheader "Price"
- table [ref=e29]                      - table "Monthly totals"
```

## Results (`npm run repro`)
| Case | Element and where its name comes from | AI mode |
|---|---|---|
| A | region, `aria-label` | kept |
| C | region, `aria-labelledby` → heading **outside** it | kept |
| D | region, `aria-labelledby` → **hidden** element inside | kept |
| B | region, `aria-labelledby` → visible heading inside | **dropped** |
| E | navigation, `aria-labelledby` → visible heading inside | **dropped** |
| F | dialog, `aria-labelledby` → visible heading inside | **dropped** |
| G | columnheader, content: a sort `<button>` inside the cell | **dropped** |
| I | table, native `<caption>` | **dropped** |
| H | group, native `<legend>` in `<fieldset>` | kept |
| J | figure, native `<figcaption>` | kept |

In every dropped case `getByRole` finds the element and default mode keeps the name; only the AI-mode assertion fails (line 23 of the spec), on both engines.

## Cause
`removeRedundantNames`, one of the AI-mode distiller plugins (`aiPlugins`), sets `node.name = ''` when every element contributing to the name (`nameFromContentRefs`) is also printed as a descendant. That saves tokens for buttons and links whose name is their own text. For containers (dialogs, landmarks, regions, tables, column headers) the name is how they're identified (`getByRole('dialog', { name })`), and the contributing heading is printed as an ordinary child with nothing tying it to the container. The rule doesn't look at the role, and leaves no marker. (Related, not the same: microsoft/playwright#41985, fixed by #41988 in 1.62, restored names lost when a contributing wrapper was collapsed; it didn't change this rule.)

## Why it matters
Agents choose locators from this snapshot. In our testing, agents concluded that dialogs and regions had no accessible name, filed false accessibility bugs, and fell back to `locator('dialog')`, which then hit strict-mode violations on a page with several dialogs.

## Run it
```bash
npm run repro        # Playwright Test, public API: ariaSnapshot({ mode: 'ai' }) vs default, Chromium + WebKit
npm run repro:cli    # the same page through `npx playwright cli snapshot`
```
Requires Playwright 1.64.1 and its browsers (`npx playwright install chromium webkit`); `repro:cli` needs Python 3 for a throwaway local server (the CLI blocks `file:` URLs).

## Existing reports checked (2026-10-30)
Searched microsoft/playwright, microsoft/playwright-mcp and microsoft/playwright-cli issues for snapshot/AI-snapshot names, `aria-labelledby`, dialogs, landmarks and accessible names. No existing report of this behaviour; closest are microsoft/playwright#41985 (fixed, a different trigger), playwright-mcp#1690 (refiled as #41985) and microsoft/playwright#43549 (`ariaLabelledByElements`, a different mechanism).

## Suggested fix
Keep the name for roles whose name identifies the container (dialog, alertdialog, region, navigation, main, complementary, form, search, group, table, grid, columnheader, rowheader, tabpanel…), or print a marker such as `dialog "Delete item?" (from heading)` instead of dropping it.
