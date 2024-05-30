import { Notificacion } from "../model/notificacionModel.js";

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

















}




export default NotificacionController;