import { Router } from "express";
import ServicioController  from "../controllers/ServicioController.js";
import { validateSchema } from "../../../middlewares/ValidatorSchema.js";
import { createEschema } from "../schemas/ServicioEschema.js";
import {authRequired, authRequired2} from '../../../middlewares/validateToken.js';

const ServicioRouter = Router()

// Endpoints
ServicioRouter.get('/todos', authRequired,ServicioController.index)
ServicioRouter.get('/seleccionar/:id',authRequired, ServicioController.getById)
ServicioRouter.post('/crear',authRequired, validateSchema(createEschema), ServicioController.create)
ServicioRouter.delete('/eliminar/:id',authRequired, ServicioController.delete)
// ServicioRouter.post('/actualizar/:id', /*validateSchema(updateEschema)*/, ServicioController.update)

export default ServicioRouter