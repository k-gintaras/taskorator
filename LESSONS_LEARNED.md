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

## General Takeaway

- Always check for default exports when using `require()`.
- Prefer modular SDK initialization and DI to avoid boilerplate and zone issues.

## Future Ideas

- Maintain guide files (`DESIGN_SYSTEM.md`, `PROJECT_ARCHITECTURE.md`, etc.) for quick reference and consistency.
- Consider creating `scripts.js` tools for GPT-based automation (scanning for interfaces, TODOs, code patterns).
- Envision a "SUPER guide" that consolidates lessons, project structure, design rules, and available scripts for on-the-fly troubleshooting.
