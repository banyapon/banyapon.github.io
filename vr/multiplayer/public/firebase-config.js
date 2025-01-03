// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDSFu_VeM-FoT3vfZcjgSuYcneFOK4eKTY",
    authDomain: "classquest-675af.firebaseapp.com",
    databaseURL: "https://classquest-675af.firebaseio.com",
    projectId: "classquest-675af",
    storageBucket: "classquest-675af.appspot.com",
    messagingSenderId: "9106053072",
    appId: "1:9106053072:web:d9e1f5079937a4eac64bd5"
  };
  
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  