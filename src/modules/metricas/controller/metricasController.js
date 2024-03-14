import { Metricas } from "../model/metricasModel.js";
import { user } from "../../usuarios/model/UserModel.js";
import date from "date-and-time"

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
}

export default MetricasController
