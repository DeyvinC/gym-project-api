const express = require('express');
const cors = require('cors');

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;


const credentials = require('./credentials.json');


function connectToFirestore () {
    if(!getApps().length){
        initializeApp({
            credential: cert(credentials)
        })
    }
    return getFirestore();
}


// GET COLLECTIONS 

app.get('/workout', (req,res) => {
    const db = connectToFirestore()
    db.collection('workout').get()
    .then(snapshot => {
        const workouts = snapshot.docs.map(doc => {
            let workout = doc.data()
            workout.id = doc.id
            return workout
        })
        res.status(200).send(workouts)
    })
    .catch(err => res.status(500).send(err))
})

app.get('/history', (req,res) => {
    const db = connectToFirestore()
    db.collection('history').get()
    .then(snapshot => {
        const histories = snapshot.docs.map(doc => {
            let history = doc.data()
            history.id = doc.id
            return history
        })
        res.status(200).send(histories)
    })
    .catch(err => res.status(500).send(err))
})

app.get('/workout/:id', (request, response) => {
    const { id } = request.params;
    const db = connectToFirestore()
    db.collection('workout').doc(id).get()
        .then(doc => {
            let workout = doc.data()
            workout.id = doc.id
            response.send(workout);
        })
        .catch(err => console.error(err));
})




// POST COLLECTIONS 

app.post('/workout', (req,res) => {
    const db = connectToFirestore()
    db.collection('workout').add(req.body)
    .then(() => res.send('Workout collection successfully added'))
    .catch(err => res.status(500).send(err))

})

app.post('/history', (request,response) => {
    const db = connectToFirestore()
    const timestamp = FieldValue.serverTimestamp()
    db.collection('history')
    .add({...request.body, timestamp})
    .then(() => {
        response.status(202).send({
            success: true,
            message: 'Completed Workouts Updated',

        })
    })
    .catch(err => response.status(500).send(err))
})

// PATCH A COLLECTION

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})