import { Router } from "express";
import  {register, getByProject, deleteById, updateTask} from "../controllers/TareaController.js";
import {authRequired, authRequired2} from '../../../middlewares/validateToken.js';
import {validateSchema} from "../../../middlewares/ValidatorSchema.js";
import {createTarea} from "../schemas/TareaSchema.js"

const router = Router();

router.post('/crear',validateSchema(createTarea),register)

router.get('/proyecto/:id',getByProject)

router.get('/proyecto-usuario/:id',getByProject)

router.get('/seleccionar/:id',getByProject)

router.delete('/eliminar/:id',deleteById)

router.put('/actualizar/:id',updateTask)

export default router;