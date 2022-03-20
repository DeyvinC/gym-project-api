const express = require('express');
const cors = require('cors');
const { FieldValue } = require('firebase-admin/firestore');

const { connectToFirestore } = require('./connectDb')
const { createUser, getUsers, loginUser } = require('./users')

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;


// GET COLLECTIONS 

app.get('/workout', (req, res) => {
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

app.get('/users', getUsers)


app.get('/history/:userId', (request, response) => {
    const db = connectToFirestore()
    db.collection('users').doc(request.params.userId).get()
        .then((doc) => {
            let userData = doc.data()
            userData.id = doc.id
            response.send(userData.history);
            console.log(userData.history)
        })
        .catch(err => response.status(500).send(err))
})

// POST COLLECTIONS 
app.post('/users/login', loginUser)

app.post('/workout', (req, res) => {
    const db = connectToFirestore()
    db.collection('workout').add(req.body)
        .then(() => res.send('Workout collection successfully added'))
        .catch(err => res.status(500).send(err))

})

app.post('/history/:userId', (request, response) => {
    const db = connectToFirestore()
    const timestamp = Date.now()
    const history = { ...request.body, timestamp }

    console.log(request.params.userId)
    const userDocumentReference = db.collection('users').doc(request.params.userId)
    userDocumentReference.get().then((userDoc) => {
        console.log(userDoc)
        console.log(userDoc.data())
        if (!userDoc || !userDoc.data()) {
            response.status(500).send({
                status: 'failed',
                message: 'Unable to find user document'
            })
            return
        }
        let currentHistory = userDoc.data().history ? userDoc.data().history : []
        currentHistory.push(history)
        console.log(`Updated History: ${JSON.stringify(currentHistory)}`)
        userDocumentReference.update({ history: currentHistory })
        .then(() => {
            response.status(202).send({
                success: true,
                message: 'Completed Workouts Updated',
            })
        })
        .catch(err => response.status(500).send(err))
    })
})

app.post('/users', createUser)



app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})