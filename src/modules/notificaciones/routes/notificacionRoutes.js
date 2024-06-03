import { Router } from "express";
import NotificacionController  from "../controllers/notificacionController.js";
import {authRequired } from '../../../middlewares/validateToken.js';


const NotificacionRouter = Router()

// Endpoints
NotificacionRouter.get('/todos', authRequired, NotificacionController.index)
NotificacionRouter.get('/seleccionar/:id_proyecto', authRequired, NotificacionController.getByProject)
NotificacionRouter.post('/actualizar/:id_proyecto', authRequired, NotificacionController.editarLista)

export default NotificacionRouter