# Taskorator

![logo](/readme-resources/generated-app-logo.png)

A practical hierarchical task management application built with Angular, focusing on efficient task organization and straightforward data management.

## Overview

Taskorator provides an intuitive platform for organizing tasks in hierarchical structures. Built with Angular 17 and Firebase, it offers a practical approach to task management with in-memory caching for improved performance.

## Key Features

- **Task Hierarchy**: Create and manage tasks with parent-child relationships
- **Surface-Level Loading**: Efficient data loading by requesting only direct child tasks
- **In-Memory Caching**: Simple but effective caching of Firebase requests
- **Firebase Integration**: Real-time database capabilities
- **Responsive Design**: Consistent experience across devices

![logo](/readme-resources/navigating.gif)
![logo](/readme-resources/move-task.gif)
![logo](/readme-resources/promote-demote.gif)
![logo](/readme-resources/tree-view.gif)
![logo](/readme-resources/create-task-and-children.gif)

## Core Modules

### 🛠️ Dreamforge

Task creation and customization hub.

### 👁️ Sentinel

Task monitoring and management interface.

### ⚡ Nexus

Time-based task organization.

### 🌀 Vortex

Task visualization interface.

### ⚔️ Crucible

Batch task management capabilities.

## Technical Implementation

### Data Loading Strategy

Taskorator uses a parent-based loading approach:

- Loads only direct child tasks of the selected parent
- Reduces unnecessary data fetching
- Maintains performance with large task hierarchies
- Simple navigation through task levels

### Caching Implementation

Simple but effective in-memory caching:

- Stores Firebase request results in memory
- Returns cached data when available
- Reduces Firebase calls for frequently accessed data
- Page refresh available for manual cache clearing

### Firebase Integration

- Real-time database using Firestore
- Basic security rules for API access control
- Foundation for future feature expansion
- Prepared for GPT API integration with user-based access rules

## Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/taskorator.git
cd taskorator
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the development server**

```bash
ng serve
```

Visit `http://localhost:4200` to access the application.

## Technical Stack

- **Frontend**: Angular 17
- **UI Framework**: Angular Material
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: SCSS
- **State Management**: Simple service-based caching

## Development Approaches & Solutions

### 1. Efficient Data Loading

**Challenge**: Managing large sets of hierarchical tasks.
**Solution**: Implemented parent-based loading strategy, only fetching direct child tasks when needed.

### 2. Performance Optimization

**Challenge**: Reducing Firebase calls while maintaining data access.
**Solution**: Simple in-memory caching of Firebase requests, with manual refresh option when needed.

### 3. API Integration

**Challenge**: Preparing for future features like GPT integration.
**Solution**: Firebase rules structure ready for user-based API access control.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<!-- Build Status Badges -->

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
