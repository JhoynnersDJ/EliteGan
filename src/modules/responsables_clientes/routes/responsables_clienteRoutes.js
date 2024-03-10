import { Router } from "express";
import ResponsablesClienteController  from "../controllers/responsables_clienteController.js";

const ResponsablesClientesRouter = Router()


ResponsablesClientesRouter.post('/crear', ResponsablesClienteController.create)


export default ResponsablesClientesRouter