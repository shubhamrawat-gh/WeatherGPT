# RescueLens AI — Developer & AI Agent Context Handbook

Welcome! This document provides an exhaustive overview of the **RescueLens AI** codebase, architecture, style specifications, and history. It is designed to get any AI developer, team member, or automation tool up to speed in seconds.

---

## 1. System Overview & Core Mission
* **Product Name**: RescueLens AI
* **Category**: AI-Powered Disaster Intelligence & Emergency Response Platform
* **Mission**: Enable emergency responders, NGOs, volunteers, and national authorities to rapidly assess disaster zones, track affected regions, map critical resources (e.g., shelters, hospitals, clean water), and coordinate real-time relief operations using computer vision intelligence and geospatial systems.

---

## 2. Directory Structure & File Registry
Below is the directory map of the application. All paths are relative to the project root.

```
RL AI/
├── src/
│   ├── main.tsx                      # StrictMode entrypoint, bootstrap index.css and App.tsx
│   ├── App.tsx                       # Router provider bootstrap
│   │
│   ├── routes/
│   │   └── index.tsx                 # Centralized React Router Router definitions (Scalable layout/page structures)
│   │
│   ├── index.css                     # Tailwind CSS v4, custom theme variables, base styles, and utility classes
│   │
│   ├── components/                   # Modular reusable components
│   │   ├── AppLayout.tsx             # Public landing page outer layout wrapper (sticky navbar & footer)
│   │   ├── Navbar.tsx                # Public sticky header with scroll detection & smooth scroll support
│   │   ├── Footer.tsx                # Public footer layout
│   │   ├── SEO.tsx                   # Hook-like manager for dynamic document title & meta descriptions
│   │   ├── GlobeContainer.tsx        # Performance-guard wrapper using React.lazy to dynamically load Globe3D
│   │   ├── Globe3D.tsx               # Core WebGL 3D Globe with night textures, auto-rotation, interactions, and marker synchronization
│   │   ├── auth/                     # Reusable Auth Component System
│   │   │   ├── AuthLayout.tsx        # Centered frame layout with grid pattern background
│   │   │   ├── AuthCard.tsx          # Motion-animated card panel
│   │   │   ├── AuthHeader.tsx        # Logo and text headers
│   │   │   ├── AuthInput.tsx         # Standardized, accessible inputs with Lucide icons
│   │   │   ├── AuthButton.tsx        # Multi-state loading action button
│   │   │   └── AuthFooter.tsx        # Footer block containing security and help warnings
│   │   │
│   │   └── dashboard/                # Reusable Dashboard Layout System
│   │       ├── DashboardLayout.tsx   # Outer structure layout (integrates Topbar, Sidebar, Content outlet)
│   │       ├── DashboardSidebar.tsx  # Interactive navigation menu (supports toggle actions & active tab indicators)
│   │       ├── DashboardTopbar.tsx   # Dashboard header carrying contextual titles and CTA action controls
│   │       ├── PageHeader.tsx        # Contextual titles for specific page routes
│   │       ├── ActionButton.tsx      # Standardized actions buttons for the console (supports loading spinner and disabled state)
│   │       ├── DashboardCard.tsx     # Framer-motion cards used for operational previews
│   │       ├── EmptyState.tsx        # Central illustration / state block representing un-implemented layers
│   │       ├── SectionContainer.tsx  # Flex block layout dividers
│   │       │
│   │       ├── incidents/            # Modular components for Phase 4 Incident Wizard
│   │       │   ├── FormActions.tsx   # Backward/forward transition controls
│   │       │   ├── FormField.tsx     # Accessible inputs and validation feedback wrapper
│   │       │   ├── ReviewPanel.tsx   # Confirmation panel summarizing user inputs and uploaded files
│   │       │   ├── Stepper.tsx       # Progress tracking indicator for the Wizard steps
│   │       │   └── UploadZone.tsx    # Drag-and-drop file/image staging interface (supports staging files)
│   │       │
│   │       ├── help/                 # Modular components for Phase 5 Help Requests Wizard
│   │       │   ├── HelpRequestForm.tsx # State coordinator and flow manager for multi-step request
│   │       │   ├── RequestCategoryCard.tsx # Reusable category selector element
│   │       │   ├── PrioritySelector.tsx # Custom select UI mapping Low/Medium/High/Critical levels
│   │       │   ├── LocationSection.tsx # Staging bounds details and future map picker stubs
│   │       │   ├── ContactSection.tsx # Core responder/individual details fields
│   │       │   ├── ReviewPanel.tsx   # Final layout displaying all telemetry targets
│   │       │   ├── SuccessState.tsx  # Completion banner linking back to list view
│   │       │   └── EmptyState.tsx    # Reusable modular view mapping empty logs/queues
│   │       │
│   │       └── maps/                 # Modular components for Geospatial Operations Console
│   │           ├── MapContainer.tsx  # Core MapLibre GL OpenStreetMap integration (with custom dark filters)
│   │           ├── MapToolbar.tsx    # Sub-route navigation tabs strip
│   │           ├── MapControls.tsx   # Floating maps controls (Zoom +/-, Reset, View mode toggle, Fullscreen)
│   │           ├── MapLegend.tsx     # Color keys overlay representing staging grounds and corridors
│   │           ├── LayerPanel.tsx    # Toggle card layout mapping modular overlays
│   │           ├── MapEmptyState.tsx # Reusable empty state view inside panels
│   │           └── MapSection.tsx    # Responsive grid/flex layout split for maps viewport and panel
│   │       │
│   │       ├── globe/                # Modular components for 3D Globe Command Center
│   │       │   ├── GlobeStatusCard.tsx # Displays telemetry status, regional focus, and active layer counts
│   │       │   ├── GlobeControls.tsx # Toggles auto-rotation, layer overlays, and camera view resets
│   │       │   ├── GlobeLegend.tsx   # Color keys overlay identifying marker pin categories on the globe
│   │       │   ├── CountryPanel.tsx  # Selected boundary information card showing sovereign names & ISO codes
│   │       │   └── layers/           # Declarative overlays stubs for mapping sync
│   │       │       ├── IncidentLayer.tsx
│   │       │       ├── ResourceLayer.tsx
│   │       │       └── HotspotLayer.tsx
│   │       │
│   │
│   └── pages/                        # Route Page Modules
│       ├── LandingPage.tsx           # Multi-section marketing product landing page
│       ├── LoginPage.tsx             # Login interface built using the auth components (simulated bypass redirect)
│       ├── ForgotPasswordPage.tsx    # Recovery email trigger form
│       ├── ResetPasswordPage.tsx     # Password set verification screen
│       │
│       └── dashboard/                # Command Console sub-routes
│           ├── DashboardHome.tsx     # Operations center dashboard (pipelines status, alerts, maps entrypoint)
│           ├── MapsPage.tsx          # Geospatial Operations Console layout (holds MapContainer and panel Outlets)
│           ├── MapDefaultPage.tsx    # Live target overview (displays active coordinates and telemetry status)
│           ├── MapResourcesPage.tsx  # Resource Discovery (lists categories with professional empty state)
│           ├── MapIncidentsPage.tsx  # Incident Visualization (lists categories with professional empty state)
│           ├── MapLayersPage.tsx     # Layer Control (renders LayerPanel)
│           ├── IncidentsPage.tsx     # Incident management queue mock (triggers report incident flow)
│           ├── NewIncidentPage.tsx   # 4-step wizard interface for intake of natural disaster incident reports
│           ├── HelpPage.tsx          # Emergency Assistance Center Dashboard (with category grids and active queue)
│           ├── NewHelpRequestPage.tsx # Intake request wizard form entry page
│           ├── HelpHistoryPage.tsx   # Assistance request history list empty state
│           └── SettingsPage.tsx      # Preferences: user configuration, notifications, and telemetry formats
│
├── public/                           # Static assets directory
├── package.json                      # Build script pipelines and package lock mappings
├── tsconfig.json                     # Root configuration for Typescript modules
├── vite.config.ts                    # Build config containing plugins for React & Tailwind CSS v4 compiler
├── AGENTS.md                         # Rulebook: Vercel React Best Practices
├── React SKILL.md                    # Structured AI agent rulebook for code styling
└── DESIGN.md                         # Product design principles handbook
```

---

## 3. Technology Stack & Dependencies
The platform relies on a modern, ultra-fast frontend build system:
* **Core Framework**: React 19.2 (Strict Mode enabled)
* **Build System**: Vite 8.0 (fast dev compile times and HMR)
* **Language**: TypeScript 6.0 (configured with verbatim imports for type safety)
* **Router**: React Router DOM 7.1 (fully scalable nested children route setup)
* **Styles**: Tailwind CSS v4.3 (native CSS `@tailwindcss/vite` plugin compilation, config-file-free architecture)
* **Animations**: Framer Motion 12.4 (smooth hardware-accelerated micro-interactions)
* **Icons**: Lucide React 1.18

---

## 4. Design System & Brand Identity
RescueLens AI uses a developer-first dark mode appearance inspired by high-productivity apps (such as Linear, Vercel, and Arc):
* **Colors & Theme Token Registry** (declared in `src/index.css` `@theme` rule):
  * **Main Canvas Background**: `--color-canvas-dark: #001e2b` (Deep, elegant dark teal canvas)
  * **Primary Accent Color**: `--color-brand-green: #00ed64` (Bright vibrant green)
  * **Accents**: `--color-brand-teal: #003d4f` / Mid Accent: `--color-brand-teal-mid: #00684a`
  * **Surface Panels**: `--color-surface-dark: #0a202c` (Soft card backgrounds with subtle borders)
  * **Muted Copy**: `--color-muted-dark: #a8b3bc`
  * **Border Hairlines**: `--color-hairline-dark: #1c2d38` (Fine thin grids)
* **Typography System**:
  * **Body/Interface**: `Inter` (sans-serif)
  * **Data/Telemetry/Labels**: `Source Code Pro` (monospaced)
* **Layout Utilities**:
  * `.glass-panel`: Blurs backing layers (`backdrop-blur-md`) and overlays a dark canvas opacity with hairline borders.
  * `.text-gradient`: Horizontal gradient transitioning text from white through soft green to brand green.
* **Touch Target Standards**:
  * Primary CTAs: Pill buttons with padding `px-8 py-3.5`
  * Secondary / Headers: Pill buttons with padding `px-6 py-3`
  * Forms: Inputs and submit button heights constrained to `h-12` for clear accessibility.

---

## 5. Architectural & Coding Guidelines
Always adhere to these guidelines during codebase modifications:

1. **Vercel React Best Practices (`AGENTS.md`)**:
   * **No Waterfalls**: Start promises early, await late. Use `Promise.all` for parallel operations.
   * **Optimized Imports**: Import directly from sub-modules when necessary to optimize code splitting and build size.
   * **Passive Scrolling**: The navbar window listener uses `{ passive: true }` to eliminate layout thrashing during scroll.
   * **Clean Conditional Rendering**: Prefer explicit ternary operators (`cond ? x : y`) over inline logic operators (`cond && x`) to prevent unexpected layout issues (e.g. rendering `0`).
   * **Route Lazy Loading**: Lazy-load all dashboard sub-routes (`React.lazy`) and wrap the dashboard `Outlet` in a `<Suspense>` boundary in `DashboardLayout.tsx` to keep maps and other heavy code separated from the initial landing page bundle.
2. **SEO Integration (`src/components/SEO.tsx`)**:
   * Every page route should consume the `<SEO />` component.
   * Dynamically coordinates document title formatting and configures description tags in the HTML body header.
3. **Form Validations**:
   * Perform client-side validating checks before submissions.
   * Support dynamic warning borders and loading spinners in submission buttons.
4. **Clean Component Architecture**:
   * Shared layouts are placed in `src/components/`.
   * Pages and views are located in `src/pages/`.
   * Group domain-specific subcomponents inside subfolders (e.g. `src/components/auth/`, `src/components/dashboard/`).
5. **No Placeholders**:
   * Never leave empty placeholders or raw developer notes. Ensure clean, interactive mock interfaces, badges, and empty-state placeholders are used until active integrations are connected.

---

## 6. Simulated Flows & Bypasses (Current Setup)
* **Authentication**: There is no live authentication directory connected. Submit buttons on `LoginPage` evaluate email format & password lengths, and then call a simulated redirect to the `/dashboard`.
* **Operations State**: `DashboardHome.tsx` contains static status elements showing the main backend server online while AI and Mapping engines are listed as `PLANNED` for future milestones.
* **Geospatial Map View**: `MapsPage.tsx` implements a beautiful mockup layout featuring layered dashboard panels (Terrain, Satellite, Hazards) with a retro dotted coordinates canvas representing geospatial data loading loops.
* **Incident Reporting**: `NewIncidentPage.tsx` implements an operational 4-step wizard (Incident Info, Location, Upload, Review) with client-side field validation, drag-and-drop file staging, and review screen hooks, routing to a success confirmation panel.
* **Help Request System**: `HelpPage.tsx` acts as the Emergency Assistance Center dashboard displaying category cards, CTA launchers, and an empty staging queue. `NewHelpRequestPage.tsx` runs the 4-step assistance intake form (Request Details, Location, Contact, Review) with validation and transitions. `HelpHistoryPage.tsx` houses a professional empty state for request logs.

---

## 7. Upcoming Milestones & Integration Roadmap
When extending the platform, focus on these planned integrations:
1. **Interactive Geospatial Engines**:
   * Replace the dotted-grid viewport on `src/pages/dashboard/MapsPage.tsx` with a Leaflet / Mapbox container.
   * Bind the sidebar layer controls to trigger active coordinates.
2. **Active Database Pipelines**:
   * Connect the Incident reporting wizard (`NewIncidentPage.tsx`) and Coordination panel (`HelpPage.tsx`) to real data layers (e.g. PostgreSQL or MongoDB) for saving reports.
3. **Real-time Dispatch Alerts**:
   * Wire the Alert indicators on `src/pages/dashboard/SettingsPage.tsx` to dispatch WebSockets/SMS notifications.
4. **Third-Party Authentication**:
   * Replace the auth flow bypass in `src/pages/LoginPage.tsx` with production middleware (such as Firebase Auth or Clerk).
