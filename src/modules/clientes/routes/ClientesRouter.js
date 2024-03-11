import { Router } from "express";
import ClientesController  from "../controllers/ClientesController.js";

const ClientesRouter = Router()

ClientesRouter.get('/todos', ClientesController.index)
ClientesRouter.get('/seleccionar/:id', ClientesController.getById)
ClientesRouter.post('/crear', ClientesController.create)


export default ClientesRouter