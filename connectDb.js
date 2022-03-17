const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const credentials = require('./credentials.json');

exports.connectToFirestore = () => {
    if(!getApps().length){
        initializeApp({
            credential: cert(credentials)
        })
    }
    return getFirestore();
}

