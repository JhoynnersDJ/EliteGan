import { Router } from "express";
import MetricasController from "../controller/metricasController.js";
import {authRequired, authRequired2} from '../../../middlewares/validateToken.js';

const MetricasRouter = Router()

// Endpoints
MetricasRouter.get('/proyectos-completados/:id_usuario', authRequired,MetricasController.proyectosCompletadosByUsuario)
MetricasRouter.get('/proyectos-recientes', authRequired,MetricasController.proyectosRecientes)
MetricasRouter.get('/proyecto/:id_proyecto',authRequired, MetricasController.metricasProyectoById)
MetricasRouter.get('/proyectos-recientes-por-usuario/:id_usuario', authRequired,MetricasController.proyectosRecientesByUser)
MetricasRouter.get('/tareas-registradas/:id_usuario',authRequired, MetricasController.tareasByTecnico)
MetricasRouter.get('/tareas-tiempo-total/:id_usuario',authRequired, MetricasController.tareasFactorTotalByUser)
MetricasRouter.get('/tareas-por-tecnico-proyecto/:id_proyecto',authRequired, MetricasController.tareasPorTecnicoByProyecto)

export default MetricasRouter