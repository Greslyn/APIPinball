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

});



app.get('/scores', (req, res) => {

    Score.find({}).sort({ Score: -1 }).limit(5).then(function(users){

        res.json(users)
    }).catch(function(err){
        console.log(err)
    })
});

app.delete('/deleteFirst', (req, res) => {
    // Encuentra el primer documento basado en la puntuación más alta y elimínalo
    Score.findOneAndDelete({}).sort({ Score: -1 }).then(function(deletedDocument){
        if(deletedDocument) {
            res.status(200).json({ message: "Primer puesto borrado correctamente", deletedDocument });
        } else {
            res.status(404).json({ message: "No se encontró el documento para borrar" });
        }
    }).catch(function(err){
        console.log(err);
        res.status(500).json({ error: err });
    });
});
//endpoint
app.put('/updateFirst', (req, res) => {
    const {Username, Score } = req.body;

    // Encuentra el documento con la puntuación más alta y actualízalo
    Score.findOneAndUpdate({}, { Username: Username, Score: Score }, { sort: {  Score: -1 }})
    .then(function(updatedDocument){
        if(updatedDocument) {
            console.log("Primer puesto actualizado correctamente", updatedDocument);
            res.status(200).json({ message: "Primer puesto actualizado correctamente", updatedDocument });
        } else {
            res.status(404).json({ message: "No se encontró el documento para actualizar" });
        }
    })
    .catch(function(err){
        console.log(err);
        res.status(500).json({ error: err });
    });
});

app.listen(3000, () => console.log('Server listening on port 3000'));