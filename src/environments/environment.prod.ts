export const environment = {
  production: true,
  isTesting: false,
  // IMPORTANT: Replace with your actual production AI API endpoint
  // For now, this will cause the forge feature to be disabled in production
  // You need to deploy your AI backend and update this URL
  aiApiBaseUrl: 'https://your-production-ai-api.example.com',
  firebase: {
    projectId: 'taskorator',
    appId: '1:799643180199:web:3a44fe3dcb6b8b5aeecf82',
    storageBucket: 'taskorator.appspot.com',
    apiKey: 'AIzaSyDrlKwP-ALtE5VFBn78t1yk8QDhx6PoXnI',
    authDomain: 'taskorator.firebaseapp.com',
    messagingSenderId: '799643180199',
    measurementId: 'G-HBL7JCRWL0',
  },
};

export const firebaseAiApi={
  apiKey: "AIzaSyDsv1tMs0kxF0rfQdds0qKZh0ua9rPqamI",
  authDomain: "ai-api-5c92d.firebaseapp.com",
  projectId: "ai-api-5c92d",
  storageBucket: "ai-api-5c92d.firebasestorage.app",
  messagingSenderId: "737017354476",
  appId: "1:737017354476:web:ff970053946c5292b6adc9"
}
