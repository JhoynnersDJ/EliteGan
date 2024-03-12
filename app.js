import 'dotenv/config'; // Cargar variables de entorno desde .env
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import {sequelize} from './src/database/sequelize.js';
import {sequelizeClients} from './src/database/sequelize.js';

import ClientesRouter from './src/modules/clientes/routes/ClientesRouter.js';
import ResponsablesClienteRouter from './src/modules/responsables_clientes/routes/responsables_clienteRoutes.js';
import ServicioRouter from './src/modules/servicios/routes/ServicioRouter.js'
import ProyectoRouter from './src/modules/proyectos/routes/ProyectoRouter.js'

//usuarios
import UsuariosRouter from './src/modules/usuarios/routes/usuarios.js'

//feriados
import FeriadosRouter from './src/modules/feriados/routes/feriados.js'

//tareas
import TareasRouter from './src/modules/tareas/routes/tareas.js'

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

await sequelizeClients.sync({ force: false }).then(() => {
  console.log('Modelo sincronizado con la base de datos de clientes');
});

//Middleware para  cliente
app.use('/clientes', ClientesRouter);

//Middleware para responsable cliente
app.use('/responsables-cliente', ResponsablesClienteRouter);

//Middleware para usuarios
app.use('/usuarios', UsuariosRouter);

//Middleware para feriados
app.use('/feriados', FeriadosRouter);

//Middleware para tareas
app.use('/tareas', TareasRouter);
//Middleware para servicios
app.use('/servicios', ServicioRouter);
//Middleware para proyectos
app.use('/proyectos', ProyectoRouter);

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`La aplicación está corriendo en http://${host}:${port}`);
});