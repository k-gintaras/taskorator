import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { environment } from './environments/environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// import { AngularFireFirestoreModule } from '@angular/fire/compat/firestore';  // removed erroneous import

// Import main app component and test component
import { AppComponent } from './app/app.component';

import { routes } from './app/app.routes';
import { TestAppComponent } from './app/test-files/test-app.component';
import { setLogLevel,LogLevel } from '@angular/fire';
// import { AuthService } from './app/services/core/auth.service';
// import { TestAuthService } from './app/services/test-services/test-auth.service';
// import { testRoutes } from './app/test-files/test-app.routes';
// import { SimpleNavigatorComponent } from './app/features/task-navigator/simple-navigator/simple-navigator.component';
// import { TestAppComponent } from './app/test-files/test-app.component';
// import { TestComponent } from './app/test-files/test/test.component';

setLogLevel(LogLevel.SILENT);


if (environment.production) {
  enableProdMode();
}

const firebaseJson = environment.firebase;
const isTesting = environment.isTesting; // Add this to your environment configuration

if (isTesting) {
  console.warn('TESTING enabled:');
  bootstrapApplication(TestAppComponent, {
    providers: [
      importProvidersFrom(
        BrowserAnimationsModule,
        RouterModule.forRoot(routes)
      ),
      provideAnimationsAsync(),
      provideHttpClient(),
      provideFirebaseApp(() => initializeApp(firebaseJson)),
      provideAuth(() => getAuth()),
      provideFirestore(() => getFirestore()),
    ],
  }).catch((err) => console.error(err));
} else {
  bootstrapApplication(AppComponent, {
    providers: [
      importProvidersFrom(
        BrowserAnimationsModule,
        RouterModule.forRoot(routes)
      ),
      provideAnimationsAsync(),
      provideHttpClient(),
      provideFirebaseApp(() => initializeApp(firebaseJson)),
      provideAuth(() => getAuth()),
      provideFirestore(() => getFirestore()),
    ],
  }).catch((err) => console.error(err));
}
