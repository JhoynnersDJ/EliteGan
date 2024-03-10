import { Router } from "express";
import  {register} from "./controllers/TareaController.js"

const router = Router();

router.get('/test',register)

export default router;