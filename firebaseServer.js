const firebase = require('firebase-admin');
const request = require('request');

const API_KEY = 'AAAA-fzWYgI:APA91bHPOQlbVKTfuExfIYubYMjAt6ubmMRRbZ0h9cPyTqWyDCbuFfaYHfYmELotDyXGby95CFFPdgHokJAhkC64oc8dDi78gqHBkI4LIoLD_gLkmQMa3LqIsXHj7LjQfQ98d4XUn9P0'; // Your Firebase Cloud Messaging Server API key

// Fetch the service account key JSON file contents
const serviceAccount = require('./KewlKoffee.json');

// Initialize the app with a service account, granting admin privileges
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://kewlkoffee.firebaseio.com/',
});
const ref = firebase.database().ref();

function listenForNotificationRequests() {
  const requests = ref.child('notificationRequests');
  requests.on('child_added', function (requestSnapshot) { // eslint-disable-line
    const request12 = requestSnapshot.val();
    sendNotificationToUser( // eslint-disable-line
      request12.username,
      request12.message,
      request12.topic,
      function () { // eslint-disable-line
        requestSnapshot.ref.remove(); // eslint-disable-line
      },
    );
  }, function(error) { // eslint-disable-line
    console.error(error);
  });
}

function sendNotificationToUser(label, message, topic, onSuccess) {
  console.log("sending");
  request.post({
    url: 'https://fcm.googleapis.com/fcm/send',
    method: 'POST',
    headers: {
      'Content-Type': ' application/json',
      Authorization: `key=${API_KEY}`,
    },
    body: JSON.stringify({
      notification: {
        body: message,
        title: label,
      },
      to: `/topics/${topic}`,
    }),
  }, function(error, response, body) { // eslint-disable-line
    if (error) {
      console.error(error);
    } // eslint-disable-line
    else if (response.statusCode >= 400) {
      console.error('HTTP Error: '+response.statusCode+' - '+response.statusMessage); // eslint-disable-line
    } // eslint-disable-line
    else {
      console.log("tókst");
      onSuccess();
    }
  });
}

// start listening
listenForNotificationRequests();
