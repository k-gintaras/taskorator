import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { RouterModule } from '@angular/router';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideHttpClient } from '@angular/common/http';

if (environment.production) {
  enableProdMode();
}

// Initialize Firebase App directly
// const app: FirebaseApp = initializeApp(environment.firebase);

// Initialize Firebase Authentication
// const auth: Auth = getAuth(app);

const firebaseJson = environment.firebase;

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserAnimationsModule, RouterModule.forRoot(routes)),
    importProvidersFrom(provideFirebaseApp(() => initializeApp(firebaseJson))),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideFirestore(() => getFirestore())),
    provideHttpClient(),
  ],
}).catch((err) => console.error(err));
