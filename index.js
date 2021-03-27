const express = require('express')

const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;

require('dotenv').config();
console.log();
const port = 5000
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wy6ti.mongodb.net/burjAlArab?retryWrites=true&w=majority`;



var serviceAccount = require("./configs/burj-al-arab-avi-firebase-adminsdk-kaw49-af744831aa.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const app = express()

app.use(cors());
app.use(bodyParser.json());

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookings = client.db("burjAlArab").collection("bookings");
    // perform actions on the collection object
    console.log('database connected')
    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                //console.log(result)
                res.send(result.insertedCount > 0);
            })
        
    })

    app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            console.log({ idToken });
            admin.auth().verifyIdToken(idToken)
                .then((decodedToken) => {
                    let tokenEmail = decodedToken.email;
                    if (tokenEmail == req.query.email) {
                        bookings.find({ email: req.query.email })
                        .toArray((err, documents) => {
                            res.status(200).send(documents);
                        })
                    }
                    else{
                        res.status(401).send('unauthorized access.')
                    }
                    // ...
                    //console.log({ uid });
                })
                .catch((error) => {
                    // Handle error
                    res.status(401).send('unauthorized access.')
                });
        }
        else{
            res.status(401).send('unauthorized access.')
        }


    })
});
//database theke data front end e show korar jonno


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})