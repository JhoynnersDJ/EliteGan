import { Router } from "express";
import ClientesController  from "../controllers/ClientesController.js";
import {authRequired, authRequired2} from '../../../middlewares/validateToken.js';

const ClientesRouter = Router()

ClientesRouter.get('/todos',authRequired, ClientesController.index)
ClientesRouter.get('/todos-indice',authRequired, ClientesController.getAll)
ClientesRouter.get('/seleccionar/:id',authRequired, ClientesController.getById)
ClientesRouter.post('/crear',authRequired, ClientesController.create)


export default ClientesRouter