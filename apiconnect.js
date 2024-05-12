// Importa el módulo Express, que es un framework para Node.js que facilita la creación de servidores web.
import express from 'express'; 

// Importa Mongoose, una librería que proporciona una forma sencilla de interactuar con MongoDB.
import mongoose, { version } from 'mongoose';

//Se utiliza para analizar el cuerpo de las solicitudes entrantes en un middleware antes de tus manejadores.
import bodyParser from 'body-parser';

// Un paquete para proporcionar un middleware Connect/Express que se puede usar para habilitar CORS(Compartición de Recursos de Origen Cruzado).
import cors from 'cors';

//Se crea una instancia de una Express.
const app = express();
//Utiliza el middleware CORS para permitir solicitudes de origen cruzado.
app.use(cors());
//Utiliza bodyParser para analizar JSON en el cuerpo de las solicitudes.
app.use(bodyParser.json());

//Define la URL de conexión a la base de datos MongoDB
const url = 'mongodb+srv://Paula:iaAwJhyoyjti3uAT@cluster0.wfwsbla.mongodb.net/Pinball?retryWrites=true&w=majority';

// Inicia la conexión a la base de datos MongoDB utilizando la URL proporcionada.
mongoose.connect(url);

// Accede a la conexión de la base de datos.
const db = mongoose.connection;

//Configura un manejador de eventos para errores de conexión
db.on('error', console.error.bind(console, 'connection error:'));

//Configura un manejador de eventos que se ejecuta una vez cuando la conexión a la base de datos se abre correctamente.
db.once('open', function() {
  console.log("Connected successfully to server");
});

//Define un esquema para los datos del usuario, especificando que cada usuario tendrá un Username y un Score
// y tienen estos mismos como requisito.
const UserSchema = new mongoose.Schema({
  Username: {type: String,required: true},
  Score: {type: Number,required: true}
},{versionKey:false});

//Crea un modelo de Mongoose llamado Score basado en el UserSchema, 
//que interactuará con la colección GameDataP en la base de datos.
const Score = mongoose.model('users', UserSchema, "GameDataP");

//Define una ruta GET en la raíz del servidor que, cuando se accede, envía un mensaje de bienvenida.
app.get('/', (req,res)=> {

    res.send("Bienvenido a la mejor Api del mundo");
});

//request and response
//Post para entregar nuevos datos a la base
app.post('/score', async (req, res) => {
    //Crea una nueva instancia con el modelo Score con los datos recibidos.
  const data = new Score({ Username: req.body.Username, Score: req.body.Score });
    try {
        //Guarda la nueva puntuación en la base de datos y envía la información guardada como respuesta.
        const saveData = await data.save();
        res.send(saveData);
        
    } catch (error) {
        console.error(error);
    }

});


//En esta parte obtiene las 5 puntuaciones mas altas.
app.get('/scores', (req, res) => {
    // Encuentra todos los documentos, los ordena por puntuación de mayor a menor y limita los resultados a 5.
    Score.find({}).sort({ Score: -1 }).limit(5).then(function(users){
        //Envía las puntuaciones como respuesta en formato JSON.
        res.json(users)
    }).catch(function(err){
        console.log(err)
    })
});

//Elimina el documento con la puntuación más alta de la base de datos.
app.delete('/deleteFirst', (req, res) => {
    // Encuentra el primer documento basado en la puntuación más alta y lo elimina
    Score.findOneAndDelete({}).sort({ Score: -1 }).then(function(deletedDocument){
        //Envía una respuesta de éxito con el documento eliminado o un mensaje de error si no se encuentra.
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

//Actualiza el documento con la puntuación más alta con nuevos datos.
app.put('/updateFirst', async(req, res) => {

    try {
        // Encuentra el documento con la puntuación más alta y lo actualiza
        const updatedDocument = await Score.findOneAndUpdate(
            {}, 
            { Username: req.body.Username, Score: req.body.Score }, 
            { sort: { Score: -1 }, new: true }
        );
        //Envía una respuesta de éxito con el documento actualizado o un mensaje de error si no se encuentra.
        if(updatedDocument) {
            console.log("Primer puesto actualizado correctamente", updatedDocument);
            res.status(200).json({ message: "Primer puesto actualizado correctamente", updatedDocument });
        } else {
            res.status(404).json({ message: "No se encontró el documento para actualizar" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }
});

//El servidor escucha en el puerto 3000 y muestra un mensaje en la consola cuando está listo para recibir solicitudes.
app.listen(3000, () => console.log('Server listening on port 3000'));

//Este conjunto de endpoints permite crear, leer, actualizar y eliminar (CRUD) puntuaciones en un sistema de clasificación para un juego.