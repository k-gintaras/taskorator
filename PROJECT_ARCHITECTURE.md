# Taskorator Project Architecture Guide

## 🏗️ **Project Overview**

**Taskorator** is an Angular 17 task management application with Firebase authentication, NX build optimization, and a mobile-first design approach.

## 📁 **Project Structure**

```
taskorator/
├── src/
│   ├── app/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── task/            # Task display components
│   │   │   ├── task-navigator/   # Main task navigation interface
│   │   │   ├── horizontal-navigation/ # Top navigation bar
│   │   │   └── [other-components]/
│   │   ├── features/            # Feature modules
│   │   │   ├── core/           # Authentication, login, welcome
│   │   │   ├── admin/          # Administrative features
│   │   │   ├── next-task-manager/ # Task management logic
│   │   │   └── [other-features]/
│   │   ├── services/           # Business logic services
│   │   │   ├── auth-state-manager.service.ts # Central auth coordinator
│   │   │   ├── navigation.service.ts # Route management
│   │   │   ├── api/            # API communication
│   │   │   ├── cache/          # Data caching
│   │   │   └── [other-services]/
│   │   ├── models/             # TypeScript interfaces and classes
│   │   └── test-files/         # Test components and data
│   ├── assets/                 # Static files (images, sounds, icons)
│   ├── environments/           # Environment configurations
│   ├── styles/                 # Global SCSS files
│   │   ├── _colors.scss       # Color system
│   │   ├── _buttons.scss      # Button styles
│   │   ├── _layout.scss       # Layout utilities
│   │   └── theme.scss         # Main theme file
│   └── stories/               # Storybook stories
├── nx.json                    # NX workspace configuration
├── project.json               # Angular project configuration
├── firebase.json             # Firebase deployment config
└── [config-files]
```

## 🔐 **Authentication Architecture**

### Core Services
- **AuthStateManagerService**: Central authentication coordinator
- **AuthService**: Firebase authentication wrapper
- **AuthOfflineService**: Offline authentication fallback
- **SessionManagerService**: Session state management
- **NavigationService**: Redirect URL preservation

### Authentication Flow
1. **Page Load**: AuthStateManager.ensureInitialized()
2. **Firebase Check**: waitForFirebaseAuthState() with 5s timeout
3. **Auth Guard**: Protects routes, preserves redirect URLs
4. **Login Process**: Handles online/offline authentication
5. **Redirect**: Navigates to saved URL after successful login

## 🧩 **Component Architecture**

### Component Categories

#### 1. **Layout Components**
- `app-horizontal-navigation`: Top navigation bar
- `app.component`: Root application container

#### 2. **Task Components**
- `app-task`: Full task display
- `app-task-mini`: Compact task representation
- `app-task-navigator`: Main task navigation interface
- `app-task-list-item`: Individual task in lists
- `app-task-edit`: Task creation/editing interface

#### 3. **Feature Components**
- `app-login`: Authentication interface
- `app-welcome`: Landing page
- `app-auto-redirect`: Navigation helper
- `app-search-create`: Task search and creation

#### 4. **Utility Components**
- `app-notification`: User feedback
- `app-error`: Error display
- `app-base`: Common component functionality

## 🛣️ **Routing Structure**

```typescript
// Main routes defined in app.routes.ts
Routes = [
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'sentinel/latestTasks', component: TaskNavigatorComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  // ... other routes
]
```

### Route Protection
- **AuthGuard**: Protects authenticated routes
- **Redirect Preservation**: Saves intended URL during authentication
- **Auto-redirect**: Returns to intended page after login

## 🎨 **Styling Architecture**

### SCSS Organization
```scss
// Import hierarchy in theme.scss
@import 'colors';      // Color system and variables
@import 'globals';     // Global styles and resets
@import 'layout';      // Layout utilities
@import 'buttons';     // Button styles
@import 'inputs';      // Form inputs
@import 'animations';  // Transitions and animations
@import 'tasks';       // Task-specific styles
@import 'lists';       // List components
```

### Design Tokens
- **Colors**: Semantic color system with primary/secondary/semantic colors
- **Spacing**: 8px base unit system (xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px)
- **Typography**: Angular Material's Roboto font family
- **Breakpoints**: Mobile-first (360px+), Tablet (768px+), Desktop (1024px+)

## 🔧 **Build & Development**

### NX Integration
- **Build Caching**: 88% speed improvement with intelligent caching
- **Parallel Execution**: Multiple tasks run simultaneously
- **Project Graph**: Visual dependency mapping
- **Cloud Integration**: Remote caching capabilities

### Development Workflow
1. **nx serve**: Development server
2. **nx build**: Production builds
3. **nx test**: Test execution
4. **nx graph**: Project visualization
5. **nx run-many**: Multi-target execution

## 📊 **State Management**

### Service-Based Architecture
- **AuthStateManagerService**: Authentication state
- **SessionManagerService**: User session data
- **NavigationService**: Route state
- **Task Services**: Task management state

### Reactive Patterns
- **Observables**: Real-time state updates
- **BehaviorSubjects**: State persistence
- **Async Pipes**: Template-based subscriptions

## 🧪 **Testing Strategy**

### Test Organization
```
src/test-files/
├── test-components/    # Component test utilities
├── test-services/      # Service test utilities
├── test-data/         # Mock data and fixtures
└── other-files/       # Additional test resources
```

### Testing Tools
- **Jasmine/Karma**: Unit testing framework
- **Angular Testing Utilities**: Component testing
- **Firebase Testing**: Authentication testing

## 🚀 **Deployment & Production**

### Firebase Integration
- **Authentication**: Google OAuth provider
- **Hosting**: Firebase hosting configuration
- **Environment**: Production/development configurations

### Performance Optimization
- **Lazy Loading**: Route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Bundle Optimization**: Webpack optimization
- **Caching**: NX build caching and browser caching

## 🔄 **Development Patterns**

### Component Creation
1. Use NX generators for consistency
2. Follow design system guidelines
3. Implement responsive design
4. Add proper accessibility features
5. Include component documentation

### Service Development
1. Single responsibility principle
2. Reactive programming patterns
3. Error handling and logging
4. Unit test coverage
5. Dependency injection

### Feature Development
1. Feature module organization
2. Lazy loading implementation
3. Route configuration
4. State management
5. Integration testing

This architecture guide serves as the foundation for understanding and extending the Taskorator application.
