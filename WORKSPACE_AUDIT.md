Workspace / CodingWorkspace Design Audit & Mobile-First Plan

Goal
----
Make the `CodingWorkspace` UI/UX best-in-class for mobile and desktop—better than v0.dev, lovable.dev, Replit, and Bolt—by the end of the month. Prioritize performance, accessibility, and a frictionless mobile-first experience.

Success Criteria (measurable)
----------------------------
- Responsive: Layout adapts cleanly across breakpoints with no horizontal scroll at 360–1920 px.
- Touch targets: All interactive controls >=44x44px on touch devices.
- Performance: Lighthouse (mobile) scores: Performance >= 75, Accessibility >= 90, Best Practices >= 90, SEO >= 60.
- Time-to-interactive (TTI): Warm navigation to workspace < 1.5s on mid-tier mobile (3G/4G simulation).
- Accessibility: All major flows keyboard-operable, ARIA roles for panels, contrast ratios >= 4.5:1 for text.
- Collaboration: Presence & cursors visible, not obstructing the editor on narrow screens.
- Onboarding: First-run flow completes in fewer than 3 taps on mobile.

Breakpoints & Layout Rules
--------------------------
- Small (mobile): up to 640px
  - Left sidebar collapses into a bottom/up drawer or off-canvas panel accessible from a top-left hamburger.
  - Right panel (preview/AI/terminal/deploy) becomes a bottom sheet (swipe up to expand) or a tabbed drawer.
  - Editor occupies full width; file navigation and other panels are modal/drawer overlays.
  - Primary toolbar: minimal; show command-palette button and project switcher.
- Medium (tablet): 641px–1024px
  - Left panel collapsible to a slimmer dock (icons-only). Right panel available as overlay or narrow pane.
- Large (desktop): 1025px+
  - Multi-column layout: left sidebar (expanded), editor center, right panel visible by default.

Touch & Mobile UX Guidelines
----------------------------
- Buttons and interactive items: min 44x44px. Use generous spacing.
- Drag handles: provide a large hit area and fall back to tappable show/hide buttons.
- Keyboard/IME: Ensure editor focus doesn't hide essential navigation; provide `Done`/`Close` actions.
- Soft keyboard handling: adjust panels so keyboard doesn't obscure essential inputs.
- Gestures: swipe to open/close side-drawer, pull-up bottom sheet for right panel, long-press for context menu.

Editor Strategy on Mobile
-------------------------
- Prefer a lightweight, optimized mobile editing experience (textarea or Monaco mobile build) with syntax-aware features disabled by default.
- Lazy-load full-featured Monaco only on demand (user toggles "Open full editor").
- Ensure copy/paste and autocomplete work with the on-screen keyboard.

Components to Refactor
----------------------
- `src/layouts/WorkspaceLayout.tsx` — main layout; prioritize mobile-first markup and state for drawers.
- `src/components/Sidebar.tsx` — collapsible/drawer variant and icon-only compact mode.
- `src/components/RightPanel.tsx` (or similar) — bottom sheet implementation for mobile.
- `src/components/TopBar.tsx` — mobile toolbar with command-palette, file search, and drawer toggles.
- `src/components/Editor.tsx` — editor mode detection (mobile/desktop) and fallback editor.

Priority implementation plan (this month)
-----------------------------------------
Week 1 (design + audit)
- Finish this audit doc and produce mobile wireframes (1–3 screens): small, medium, large.
- Implement runtime feature flag endpoint and mock AI server (done).

Week 2 (layout refactor)
- Implement responsive WorkspaceLayout: mobile drawer + bottom sheet for right panel.
- Add TopBar mobile controls and Sidebar drawer.

Week 3 (editor & touches)
- Implement mobile-friendly editor fallback and lazy-load Monaco.
- Add mobile gestures and touch improvements.

Week 4 (polish & testing)
- Performance optimizations (code-splitting, lazy-loading previews).
- Accessibility checks and visual regression tests.
- Launch beta to small group and collect metrics.

Testing Strategy
----------------
- Unit/component tests: Vitest + RTL for responsive behaviors (render at different widths).
- Visual regression: Percy/Chromatic or a Puppeteer-based snapshot pipeline.
- Automated Lighthouse runs in CI for each PR.

Acceptance checklist (short)
----------------------------
- [ ] Sidebar collapses to drawer at <=640px and reopens via hamburger.
- [ ] Right panel becomes bottom sheet at <=640px and can be expanded/collapsed with gesture.
- [ ] Editor remains responsive and editable on mobile with reasonable performance.
- [ ] All ARIA attributes and keyboard flows verified.
- [ ] Lighthouse (mobile) scores meet targets.

Next immediate actions (I can start now)
---------------------------------------
- Produce 3 quick wireframes for small / medium / large (PNG or ASCII mockups) and commit them.
- Implement the mobile layout refactor starting with `WorkspaceLayout.tsx` (create drawer components and mobile variants).
- Implement a runtime `/api/config` client fetch on app start so the mock admin toggle affects clients without rebuild.

Tell me which one to do first and I will begin:
- "wireframes": create and commit wireframes and audit artifacts (fast, helps align design)
- "layout": start implementing the mobile-first layout changes in code right away
- "runtime-config": add client-side fetch of `/api/config` at app startup (so admin toggle works for all clients)

If you want, I can start with "wireframes" and then proceed to "layout" automatically.