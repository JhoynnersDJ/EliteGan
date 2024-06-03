import { Notificacion } from "../model/notificacionModel.js";
import { Proyecto } from "../../proyectos/model/ProyectoModel.js"

class NotificacionController{
  // devuelve todos los registros
  static async index(req, res) {
    try {
      // Buscar todos los registros
      const notificacion = await Notificacion.findAll();
      // si no se encuentran registros en la base de datos
      if (!notificacion) {
        return res
          .status(204)
          .json({ message: "No hay notificaciones registradas" });
      }
      // devuelve una respuesta
      res.status(200).json(notificacion);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  // devuelve todos los registros segun el proyecto
  static async getByProject(req, res) {
    try {
      // capturar id de proyecto
      const { id_proyecto } = req.params;
      // Buscar todos los registros
      const notificaciones = await Notificacion.findByProject(id_proyecto);
      // si no se encuentran registros en la base de datos
      if (!notificaciones) {
        return res
          .status(204)
          .json({ message: "No hay notificaciones registradas" });
      }
      // devuelve una respuesta
      res.status(200).json(notificaciones);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

   // editar la lista de notificaciones de un proyecto
   static async editarLista(req, res) {
    try {
      // capturar datos del proyecto
      const { id_proyecto } = req.params
      const { usuarios } = req.body;

      // comprobar si existe el proyecto
      const proyectoExistente = await Proyecto.findByPk(id_proyecto);
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
      // actualiza lista en bd
      await Notificacion.actualizarLista(id_proyecto, usuarios)
      // devolver respuesta
      res.status(200).json({ message: "Lista actualizada correctamente" })
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }















}




export default NotificacionController;