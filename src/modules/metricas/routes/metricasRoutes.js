import { Router } from "express";
import MetricasController from "../controller/metricasController.js";

const MetricasRouter = Router()

// Endpoints
MetricasRouter.get('/proyectos-completados/:id_usuario', MetricasController.proyectosCompletadosByUsuario)
MetricasRouter.get('/proyectos-recientes', MetricasController.proyectosRecientes)
MetricasRouter.get('/proyecto/:id_proyecto', MetricasController.metricasProyectoById)
MetricasRouter.get('/proyectos-recientes-por-usuario/:id_usuario', MetricasController.proyectosRecientesByUser)
MetricasRouter.get('/tareas-registradas/:id_usuario', MetricasController.tareasByTecnico)
MetricasRouter.get('/tareas-tiempo-total/:id_usuario', MetricasController.tareasFactorTotalByUser)
MetricasRouter.get('/tareas-por-tecnico-proyecto/:id_proyecto', MetricasController.tareasPorTecnicoByProyecto)

export default MetricasRouter