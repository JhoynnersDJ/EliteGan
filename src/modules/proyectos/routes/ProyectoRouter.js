import { Router } from "express";
import ProyectoController  from "../controllers/ProyectoController.js";
import { validateSchema } from "../../../middlewares/ValidatorSchema.js";
import { createEschema, updateEschema } from "../schemas/ProyectoEschema.js";
import {authRequired,authRequired2 } from '../../../middlewares/validateToken.js';
import {rolRequired } from '../../../middlewares/validateRol.js';

const ProyectoRouter = Router()

// Endpoints
ProyectoRouter.get('/todos', authRequired, ProyectoController.index)
ProyectoRouter.get('/seleccionar/:id', authRequired, ProyectoController.getById)
ProyectoRouter.get('/usuario/:id', authRequired, ProyectoController.getByUser)
ProyectoRouter.post('/crear', authRequired, validateSchema(createEschema), ProyectoController.create)
ProyectoRouter.post('/completar/:id', authRequired, ProyectoController.concretarProyecto)
ProyectoRouter.post('/actualizar/:id', authRequired,validateSchema(updateEschema), ProyectoController.editarProyecto)
ProyectoRouter.delete('/eliminar/:id',authRequired, ProyectoController.delete)

//ProyectoRouter.get('/reporte/:id', pdf)
//ProyectoRouter.get('/Graficaproyecto/:id', ProyectoController.graph)
ProyectoRouter.get('/:id/pdf',authRequired, ProyectoController.generarPDFProyectoSimple)
ProyectoRouter.get('/:id/pdf-grafico',authRequired, ProyectoController.generarPDFProyectoGrafico)
ProyectoRouter.get('/:id/pdf-usuarios',authRequired,  ProyectoController.generarPDFProyectoSimpleUser) 

export default ProyectoRouter