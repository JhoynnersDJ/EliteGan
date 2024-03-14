import { Router } from "express";
import  {register, getByProject, deleteById, updateTask} from "../controllers/TareaController.js";
import {authRequired, authRequired2} from '../../../middlewares/validateToken.js'

const router = Router();

router.post('/crear',register)

router.get('/proyecto/:id',getByProject)

router.get('/seleccionar/:id',getByProject)

router.delete('/eliminar/:id',deleteById)

router.put('/actualizar/:id',updateTask)

export default router;