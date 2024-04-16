import { Router } from "express";
import ResponsablesClienteController  from "../controllers/responsables_clienteController.js";
import {authRequired, authRequired2} from '../../../middlewares/validateToken.js';

const ResponsablesClientesRouter = Router()

ResponsablesClientesRouter.get('/todos',authRequired, ResponsablesClienteController.index)
ResponsablesClientesRouter.get('/seleccionar/:id',authRequired, ResponsablesClienteController.getById)
ResponsablesClientesRouter.get('/cliente/:id', authRequired,ResponsablesClienteController.getByClient)
ResponsablesClientesRouter.post('/crear',authRequired, ResponsablesClienteController.create)


export default ResponsablesClientesRouter