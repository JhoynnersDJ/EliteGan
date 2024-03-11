import { Router } from "express";
import  {register} from "../controllers/TareaController.js"

const router = Router();

router.post('/test',register)

export default router;