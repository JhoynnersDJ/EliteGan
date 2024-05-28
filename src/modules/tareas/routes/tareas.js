import { Router } from "express";
import  {register, getByProject, deleteById, updateTask, getByProjectAndUser,updateTaskMaster} from "../controllers/TareaController.js";
import {authRequired, authRequired2} from '../../../middlewares/validateToken.js';
import {validateSchema} from "../../../middlewares/ValidatorSchema.js";
import {createTaskSchema, updateTaskSchema} from "../schemas/TareaSchema.js";
import {AuditoriaController} from "../../auditoria/controllers/AuditoriaController.js"

const router = Router();

router.post('/crear',authRequired2, validateSchema(createTaskSchema),AuditoriaController.resgistrarAccion("creado","tarea"),register)

router.get('/proyecto/:id',authRequired,getByProject)

router.get('/proyecto-tecnico/:id/:id_usuario',authRequired,getByProjectAndUser)

router.get('/seleccionar/:id',authRequired,getByProject)

router.delete('/eliminar/:id',authRequired, deleteById)

router.put('/actualizar/:id', authRequired,validateSchema(updateTaskSchema), AuditoriaController.resgistrarAccion("modificado","tarea"), updateTaskMaster)

export default router;