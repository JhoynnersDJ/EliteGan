import { Router } from "express";
import ClientesController  from "../controllers/ClientesController.js";

const ClientesRouter = Router()


ClientesRouter.post('/crear', ClientesController.create)


export default ClientesRouter