import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { environment } from './environments/environment';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Import main app component and test component
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { SimpleNavigatorComponent } from './app/features/task-navigator/simple-navigator/simple-navigator.component';
import { TestComponent } from './app/test-files/test/test.component';

if (environment.production) {
  enableProdMode();
}

const firebaseJson = environment.firebase;
const isTesting = environment.isTesting; // Add this to your environment configuration

if (isTesting) {
  bootstrapApplication(TestComponent, {
    providers: [
      importProvidersFrom(BrowserAnimationsModule),
      provideAnimationsAsync(),
      provideHttpClient(),
    ],
  }).catch((err) => console.error(err));
} else {
  bootstrapApplication(AppComponent, {
    providers: [
      importProvidersFrom(
        BrowserAnimationsModule,
        RouterModule.forRoot(routes)
      ),
      importProvidersFrom(
        provideFirebaseApp(() => initializeApp(firebaseJson))
      ),
      importProvidersFrom(provideAuth(() => getAuth())),
      importProvidersFrom(provideFirestore(() => getFirestore())),
      provideHttpClient(),
      provideAnimationsAsync(),
    ],
  }).catch((err) => console.error(err));
}
