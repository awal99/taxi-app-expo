import Firebase from 'firebase';
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "Your key",
    authDomain: "Domain",
    databaseURL: "database url",
    projectId: "project id",
    storageBucket: "storage bucket",
    messagingSenderId: "message id",

  };
  // Initialize Firebase
  const firebase = Firebase.initializeApp(firebaseConfig);
  export default firebase;



