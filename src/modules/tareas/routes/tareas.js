import { Router } from "express";
import  {register, getByProject, deleteById, updateTask, getByProjectAndUser} from "../controllers/TareaController.js";
import {authRequired, authRequired2} from '../../../middlewares/validateToken.js';
import {validateSchema} from "../../../middlewares/ValidatorSchema.js";
import {createTaskSchema, updateTaskSchema} from "../schemas/TareaSchema.js"

const router = Router();

router.post('/crear',validateSchema(createTaskSchema),register)

router.get('/proyecto/:id',getByProject)

router.get('/proyecto-tecnico/:id/:id_usuario',getByProjectAndUser)

router.get('/seleccionar/:id',getByProject)

router.delete('/eliminar/:id',deleteById)

router.put('/actualizar/:id',validateSchema(updateTaskSchema), updateTask)

export default router;