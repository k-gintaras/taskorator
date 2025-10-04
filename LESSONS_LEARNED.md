# Lessons Learned

## DaisyUI Setup

- We spent hours trying to integrate DaisyUI in our Tailwind project, only to discover the import syntax was incorrect.
- Incorrect:
   
  ```js
  // tailwind.config.js
  module.exports = {
    plugins: [require("daisyui")],
  };
  ```
   
- Correct:
   
  ```js
  // tailwind.config.js
  module.exports = {
    plugins: [require("daisyui").default],
  };
  ```
   
- Lesson: ESM modules often require accessing the `.default` export when using `require()`.

## Firebase Warning: "Calling Firebase APIs outside of an Injection context"

- We saw repeated warnings and attempted multiple workarounds:
  - Switched between compat and modular SDKs
  - Wrapped calls in `NgZone`
  - Created helper functions to manage Firebase calls
- Final solution:
  1. Initialize Firebase once in `main.ts`:
    
     ```ts
     import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
     import { provideAuth, getAuth } from '@angular/fire/auth';
     import { provideFirestore, getFirestore } from '@angular/fire/firestore';
     import { environment } from '../environments/environment';

     bootstrapApplication(AppComponent, {
       providers: [
         provideFirebaseApp(() => initializeApp(environment.firebase)),
         provideAuth(() => getAuth()),
         provideFirestore(() => getFirestore()),
       ]
     }).catch(err => console.error(err));
     ```
    
  2. Simplify services: use injected `Auth` and `Firestore` directly without extra wrappers.
- Now we only have a straightforward `AuthService` and `TaskApiService`, and the warning can be safely disabled if it persists.

### Zone Wrappers & Injection Context

- **What it means**: AngularFire wraps Firebase SDK calls to run outside Angular's zone so that side-effects (timers, subscriptions) don't trigger unwanted change-detection or break SSR/SSG hydration.
- **Why the warning**: If a Firebase API is called outside of AngularFire's injection context, AngularFire cannot apply its zone wrappers and logs a warning.
- **Our approach**:
  1. Centralized modular SDK setup in `main.ts` with `provideFirebaseApp`, `provideAuth`, and `provideFirestore`.
  2. Use DI in services (`AuthService`, `TaskApiService`) via constructor or `inject()`, ensuring calls originate within the injection context.
  3. Globally silence any remaining warnings in `main.ts` with `setLogLevel(LogLevel.SILENT)`.

## Offline Testing & Test Data Mode

- We found no test tasks loading because our test data was being written under the wrong user ID key and `apiStrategy` was never initialized for offline registration.
- The root cause was mutating `OFFLINE_USER_LOGIN_ID` without reinitializing `AuthOfflineService`, leading to an undefined API and empty task lists.
- Fix: Centralize test-profile suffix logic in `AuthOfflineService.localStorageKey`, reinitialize the service before offline login, and seed test data only after an explicit offline login so storage and API strategy align correctly.

## Design System Contract & Copilot

- Issue: Copilot generated inconsistent styles due to overlapping layers (CSS vars, theme-* classes, Tailwind, DaisyUI, Material, legacy custom classes).
- Solution:
  1. Defined a single source of truth in `src/styles/theme.scss` using CSS custom properties for all colors.
  2. Established `theme-*` shell classes and canonical patterns in `DESIGN_SYSTEM.md` to wrap UI components.
  3. Bound DaisyUI theme to CSS variables and safelisted key classes in `tailwind.config.js`.
  4. Introduced Stylelint/ESLint rules to forbid raw colors and non-theme class names.
  5. Provided copy/paste HTML/CSS patterns (buttons, cards, nav, inputs) for Copilot to mimic.
- Outcome: Copilot now follows the Design System Contract, producing consistent, token-based styling and avoiding drift.

## Task Selection & Database Persistence

- **Issue**: Tasks added to focus/frog/favorites weren't persisting to database despite appearing to work in the UI.
- **BIGGER MISTAKE**: The `selectedTasks` array was always empty `[]` because there was an unresolved decision/implementation issue (comment requiring a "decision") that neither of us addressed. We spent significant time debugging database persistence when the real issue was that no tasks were actually being selected/loaded.
- **Root Cause**: Components were creating minimal task objects with only `taskId` and `name` properties instead of retrieving full `UiTask` objects from `TaskListCoordinator`.
- **Micro Mistake (User)**: Not realizing that selected tasks weren't properly set with full task data before attempting to save to database.
- **Little Mistake (AI)**: Not asking or realizing early enough that the task objects being passed to settings operations lacked the necessary properties for proper database persistence.
- **Bigger Mistake (Both)**: Not addressing the fundamental issue that `selectedTasks` was always empty, leading us to debug the wrong problem entirely.
- **Solution**: Unified all task management components (Focus, Frog, Favorite) to use `TaskListCoordinator.getTasksByIds()` to retrieve complete task objects before adding to settings.
- **Lesson**: Always verify the fundamental data flow first - check if arrays are populated, services are returning data, and basic assumptions are correct before diving into complex debugging. Don't assume code is working as intended just because it compiles.

## Icon + Text Alignment (Frontend UI)

- **Issue**: Getting perfect horizontal alignment between Material Icons and text elements (h1, h2, etc.) consistently requires multiple attempts.
- **Common Problems**:
  1. Default `items-center` causes text to appear slightly above or below icon baseline
  2. Using `items-baseline` flips the problem - icon floats up, text sinks down
  3. Line-height adjustments create inconsistent results across different text sizes
- **Working Solution**:

  ```html
  <div class="flex items-center gap-3">
    <mat-icon style="font-size: 2rem; width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center;">icon_name</mat-icon>
    <h1 style="margin: 0; display: flex; align-items: center;">Title Text</h1>
  </div>
  ```

- **Key Insights**:
  - Make both icon and text into flex containers with `display: flex; align-items: center`
  - This creates "double centering" - parent centers the containers, each container centers its content
  - Eliminates line-height and baseline quirks that cause misalignment
  - Works consistently across different text sizes and icon sizes
- **Lesson**: When aligning icon + text, convert both elements to flex containers for reliable centering rather than relying on baseline or line-height adjustments.

## General Takeaway

- Always check for default exports when using `require()`.
- Prefer modular SDK initialization and DI to avoid boilerplate and zone issues.

## Future Ideas

- Maintain guide files (`DESIGN_SYSTEM.md`, `PROJECT_ARCHITECTURE.md`, etc.) for quick reference and consistency.
- Consider creating `scripts.js` tools for GPT-based automation (scanning for interfaces, TODOs, code patterns).
- Envision a "SUPER guide" that consolidates lessons, project structure, design rules, and available scripts for on-the-fly troubleshooting.
