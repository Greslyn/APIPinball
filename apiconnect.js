import express from 'express';
import mongoose, { version } from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const url = 'mongodb+srv://Paula:iaAwJhyoyjti3uAT@cluster0.wfwsbla.mongodb.net/Pinball?retryWrites=true&w=majority';

mongoose.connect(url);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected successfully to server");
});

const UserSchema = new mongoose.Schema({
  Username: {type: String,required: true},
  Score: {type: Number,required: true}
},{versionKey:false});

const Score = mongoose.model('users', UserSchema, "GameDataP");
app.get('/', (req,res)=> {

    res.send("Bienvenido a la mejor Api del mundo");
});

//request and response
//Post para entregar nuevos datos a la base
app.post('/score', async (req, res) => {
  const data = new Score({ Username: req.body.Username, Score: req.body.Score });
    try {
        const saveData = await data.save();
        res.send(saveData);
        
    } catch (error) {
        console.error(error);
    }
//   data.save((err, data) => {
//     if (err) return console.error(err);
//     res.send(data);
//   });
});

// app.get('/scores', (req, res) => {
//   Score.find((err, scores) => {
//     if (err) return console.error(err);
//     res.send(scores);
//   });
// });

app.get('/scores', (req, res) => {

    Score.find({}).sort({ Score: -1 }).limit(5).then(function(users){

        res.json(users)
    }).catch(function(err){
        console.log(err)
    })
});


app.listen(3000, () => console.log('Server listening on port 3000'));