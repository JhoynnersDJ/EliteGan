import { Router } from "express";
import  {register, getByProject, deleteById} from "../controllers/TareaController.js"

const router = Router();

router.post('/crear',register)

router.get('/proyecto/:id',getByProject)

router.get('/seleccionar/:id',getByProject)

router.delete('/eliminar/:id',deleteById)

export default router;