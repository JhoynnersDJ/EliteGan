import { Router } from "express";
import ResponsablesClienteController  from "../controllers/responsables_clienteController.js";

const ResponsablesClientesRouter = Router()

ResponsablesClientesRouter.get('/todos', ResponsablesClienteController.index)
ResponsablesClientesRouter.get('/seleccionar/:id', ResponsablesClienteController.getById)
ResponsablesClientesRouter.get('/cliente/:id', ResponsablesClienteController.getByClient)
ResponsablesClientesRouter.post('/crear', ResponsablesClienteController.create)


export default ResponsablesClientesRouter