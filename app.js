import 'dotenv/config'; // Cargar variables de entorno desde .env
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Importar el enrutador de usuario desde el archivo './usuarios/usuarios'
import {sequelize} from './src/database/sequelize.js';

const port = process.env.PORT || 3000;
const host = process.env.HOST;
const corsOrigin = process.env.CORS_ORIGIN;

const dbSelect = process.env.SELECT_DB;

const app = express();

app.use(cors({
  origin: corsOrigin,
}));
//manejo de json
app.use(express.json());
//manejo de cookies
app.use(cookieParser());
//Sincronizacion de la base de datos


await sequelize.sync({ force: false }).then(() => {
  console.log('Modelo sincronizado con la base de datos');
});



app.use(express.static('public'));

app.listen(port, () => {
  console.log(`La aplicación está corriendo en http://${host}:${port}`);
});