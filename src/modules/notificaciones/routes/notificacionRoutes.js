import { Router } from "express";
import NotificacionController  from "../controllers/notificacionController.js";
// import {authRequired,authRequired2 } from '../../../middlewares/validateToken.js';


const NotificacionRouter = Router()

// Endpoints
NotificacionRouter.get('/todos', /*authRequired*/ NotificacionController.index)
NotificacionRouter.get('/seleccionar/:id_proyecto' /*authRequired*/, NotificacionController.getByProject)
// NotificacionRouter.get('/usuario/:id' /*authRequired*/, ProyectoController.getByUser)
// NotificacionRouter.post('/crear', /*authRequired*/ validateSchema(createEschema), ProyectoController.create)
// NotificacionRouter.post('/completar/:id', authRequired,ProyectoController.concretarProyecto)
// NotificacionRouter.post('/actualizar/:id', authRequired,validateSchema(updateEschema), ProyectoController.editarProyecto)
// NotificacionRouter.delete('/eliminar/:id',authRequired, ProyectoController.delete)


export default NotificacionRouter