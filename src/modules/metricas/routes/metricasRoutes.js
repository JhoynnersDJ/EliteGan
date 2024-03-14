import { Router } from "express";
import MetricasController from "../controller/metricasController.js";

const MetricasRouter = Router()

// Endpoints
MetricasRouter.get('/proyectos-completados/:id_usuario', MetricasController.proyectosCompletadosByUsuario)
MetricasRouter.get('/proyectos-recientes/:id_usuario', MetricasController.proyectosRecientes)
MetricasRouter.get('/tareas-registradas/:id_usuario', MetricasController.tareasByTecnico)
MetricasRouter.get('/tareas-tiempo-total/:id_usuario', MetricasController.tareasFactorTotalByUser)

export default MetricasRouter