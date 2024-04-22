import { Metricas } from "../model/metricasModel.js";
import { user } from "../../usuarios/model/UserModel.js";
import { Proyecto } from "../../proyectos/model/ProyectoModel.js";
import date from "date-and-time"
import { Op } from "sequelize"

class MetricasController {
    // devuelve la cantidad de proyectos completos segun el id_usuario
    static async proyectosCompletadosByUsuario(req, res){
        try {
            // capturar datos
            const { id_usuario } = req.params
            // comprobar si existe el usuario
            const userFound = await user.findOneById(id_usuario);
            if (!userFound) {
                return res.status(404).json({
                code: "Recurso no encontrado",
                message: "Usuario no encontrado",
                details:
                    "Usuario con el id " + id_usuario + " no se encuentra en la base de datos",
                timestamp: date.format(new Date(), "YYYY-MM-DDTHH:mm:ss"),
                requestID: id_usuario,
                });
            }
            // buscar la cantidad de proyectos completados por el tecnico
            const numProyectos = await Metricas.proyectosCompletadosByUsuario(id_usuario)
            // devuelve una respuesta
            res.status(200).json(numProyectos);  
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // devuelve los 2 proyectos para todos los usuarios
    static async proyectosRecientes(req, res){
        try {
            // buscar los proyectos recientes
            const proyectos = await Metricas.proyectosRecientes()
            // si no existen proyectos
            if (proyectos.length === 0) {
                return res.status(204).json({message: 'No hay proyectos'});  
            }
            for (const proyecto of proyectos) {
                const tareas = await Metricas.tareasPorTecnicoByProyecto(proyecto.id_proyecto)
                proyecto.tareas = tareas
            }
            // devuelve una respuesta
            res.status(200).json(proyectos);  
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // devuelve las metricas de un proyecto segun su id
    static async metricasProyectoById(req, res){
        try {
            // capturar id de proyecto
            const { id_proyecto } = req.params
            // fecha tope para la busqueda
            const { fecha_busqueda_inicio, fecha_busqueda_fin } = req.body
            // buscar si el proyecto existe
            const proyectoExistente = await Proyecto.findByPk(id_proyecto)
            // si no existe el proyecto
            if (!proyectoExistente) {
                return res.status(404).json({
                  code: "Recurso no encontrado",
                  message: "Proyecto no encontrado",
                  details:
                    "Proyecto con el id " + id + " no se encuentra en la base de datos",
                  timestamp: date.format(new Date(), "YYYY-MM-DDTHH:mm:ss"),
                  requestID: id,
                });
              }
            // objeto Date con la fecha de inicio del proyecto
            let fecha_inicio = new Date(proyectoExistente.fecha_inicio)
            fecha_inicio = date.format(fecha_inicio, "YYYY-MM-DD")
            console.log(fecha_inicio)
            // objeto Date con la fecha fin del proyecto
            let fecha_fin = new Date(proyectoExistente.fecha_fin)
            fecha_fin = date.format(fecha_fin, "YYYY-MM-DD")
            console.log(fecha_fin)
            // objeto Date con la fecha de busqueda de fin del proyecto
            let fecha_fin_busqueda = new Date(fecha_busqueda_fin)
            console.log(fecha_fin_busqueda)
            // objeto Date con la fecha de busqueda de fin del proyecto
            let fecha_inicio_busqueda = new Date(fecha_busqueda_inicio)
            console.log(fecha_inicio_busqueda)
            // fecha_busqueda = date.addDays(fecha_busqueda, 1)
            fecha_fin_busqueda = date.format(fecha_fin_busqueda, "YYYY-MM-DD")
            // verificar que la fecha de busqueda fin sea posterior a la fecha de inicio
            if (fecha_fin_busqueda <= fecha_inicio) {
                return res.status(400).json(
                    {
                        code: "Bad Request",
                        message: "Fecha de búsqueda (fin) no válida, verifique que sea posterior a la fecha de creación de proyecto",
                        details: "La fecha de finalización debe ser posterior a la fecha de creación",
                        timestamp: date.format(new Date(), "YYYY-MM-DDTHH:mm:ss"),
                        requestID: fecha_fin_busqueda,
                    }
                );
            }
            // verificar que la fecha de busqueda fin sea anterior o igual a la fecha de fin
            if (fecha_fin_busqueda > fecha_fin) {
                return res.status(400).json(
                    {
                        code: "Bad Request",
                        message: "Fecha de búsqueda (fin) no válida, verifique que sea anterior o igual a la fecha de finalización de proyecto",
                        details: "La fecha de finalización debe ser posterior a la fecha de creación",
                        timestamp: date.format(new Date(), "YYYY-MM-DDTHH:mm:ss"),
                        requestID: fecha_fin_busqueda,
                    }
                );
            }
            // verificar que la fecha de busqueda inicio sea igual o superior a la fecha de inicio
            if (fecha_inicio_busqueda < fecha_inicio) {
                return res.status(400).json(
                    {
                        code: "Bad Request",
                        message: "Fecha de búsqueda (inicio) no válida, verifique que sea igual o posterior a la fecha de inicio de proyecto",
                        details: "La fecha de finalización debe ser posterior a la fecha de creación",
                        timestamp: date.format(new Date(), "YYYY-MM-DDTHH:mm:ss"),
                        requestID: fecha_inicio_busqueda,
                    }
                );
            }
            // verificar que la fecha de busqueda fin sea anterior o igual a la fecha de fin
            if (fecha_inicio_busqueda > fecha_fin) {
                return res.status(400).json(
                    {
                        code: "Bad Request",
                        message: "Fecha de búsqueda no válida, verifique que sea anterior o igual a la fecha de finalización de proyecto",
                        details: "La fecha de finalización debe ser posterior a la fecha de creación",
                        timestamp: date.format(new Date(), "YYYY-MM-DDTHH:mm:ss"),
                        requestID: fecha_fin_busqueda,
                    }
                );
            }
            // obtener las metricas de un proyecto
            const metricas = await Metricas.metricasProyecto(id_proyecto, fecha_inicio_busqueda, fecha_fin_busqueda)
            // si no existe el proyecto
            if (!metricas) {
                return res.status(404).json({message: 'Métricas no encontradas'});  
            }
            // devuelve una respuesta
            res.status(200).json(metricas);  
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // devuelve los 2 proyectos mas recientes por un usuario
    static async proyectosRecientesByUser(req, res){
        try {
            // capturar datos
            const { id_usuario } = req.params
            // comprobar si existe el usuario
            const userFound = await user.findOneById(id_usuario);
            if (!userFound) {
                return res.status(404).json({
                code: "Recurso no encontrado",
                message: "Usuario no encontrado",
                details:
                    "Usuario con el id " + id_usuario + " no se encuentra en la base de datos",
                timestamp: date.format(new Date(), "YYYY-MM-DDTHH:mm:ss"),
                requestID: id_usuario,
                });
            }
            // buscar los proyectos recientes
            const proyectos = await Metricas.proyectosRecientesByUser(id_usuario)
            // devuelve una respuesta
            if (proyectos.length === 0) {
                return res.status(204).json({message: 'Este usuario no tiene proyectos en los que aparezca'});  
            }
            res.status(200).json(proyectos);  
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // devuelve la cantidad de tareas segun el id_usuario
    static async tareasByTecnico(req, res){
        try {
            // capturar datos
            const { id_usuario } = req.params
            // comprobar si existe el usuario
            const userFound = await user.findOneById(id_usuario);
            if (!userFound) {
                return res.status(404).json({
                code: "Recurso no encontrado",
                message: "Usuario no encontrado",
                details:
                    "Usuario con el id " + id_usuario + " no se encuentra en la base de datos",
                timestamp: date.format(new Date(), "YYYY-MM-DDTHH:mm:ss"),
                requestID: id_usuario,
                });
            }
            // buscar la cantidad de tareas registradas
            const numTareas = await Metricas.tareasByTecnico(id_usuario)
            // devuelve una respuesta
            res.status(200).json(numTareas);  
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // devuelve la suma del factor tiempo total de tareas segun el id_usuario
    static async tareasFactorTotalByUser(req, res){
        try {
            // capturar datos
            const { id_usuario } = req.params
            // comprobar si existe el usuario
            const userFound = await user.findOneById(id_usuario);
            if (!userFound) {
                return res.status(404).json({
                code: "Recurso no encontrado",
                message: "Usuario no encontrado",
                details:
                    "Usuario con el id " + id_usuario + " no se encuentra en la base de datos",
                timestamp: date.format(new Date(), "YYYY-MM-DDTHH:mm:ss"),
                requestID: id_usuario,
                });
            }
            // buscar suma del factor tiempo total de un usuario
            const total = await Metricas.totalFactorByUser(id_usuario)
            // devuelve una respuesta
            res.status(200).json(total);  
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // devuelve las horas individuales y cantidad de tareas de cada tecnico en un proyecto
    static async tareasPorTecnicoByProyecto(req, res){
        try {
            // capturar datos
            const { id_proyecto } = req.params
            // comprobar si existe el usuario
            const proyectoFound = await Proyecto.findByPk(id_proyecto);
            if (!proyectoFound) {
                return res.status(404).json({
                code: "Recurso no encontrado",
                message: "Proyecto no encontrado",
                details: "Proyecto con el id " + id_proyecto + " no se encuentra en la base de datos",
                timestamp: date.format(new Date(), "YYYY-MM-DDTHH:mm:ss"),
                requestID: id_proyecto,
                });
            }
            // buscar horas individuales y cantidad de tareas de cada tecnico en un proyecto
            const tareas = await Metricas.tareasPorTecnicoByProyecto(id_proyecto)
            // devuelve una respuesta
            res.status(200).json(tareas);  
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default MetricasController
