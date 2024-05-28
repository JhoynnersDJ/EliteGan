import {Auditorias} from "../../../database/hormiwatch/auditorias.js";
import {Usuarios} from "../../../database/hormiwatch/asociaciones.js"

const database = process.env.SELECT_DB;

export class Auditoria {
    constructor (
        nombre_usuario,
        rol_usuario,
        accion,
        datos
    ) {
        this.nombre_usuario = nombre_usuario,
        this.rol_usuario = rol_usuario,
        this.accion = accion,
        this.datos = datos
    }

    // registra en la base de datos
  static async create(auditoria) {
    try {
      // funcion para las bases de datos de sequelize
      if (database === "SEQUELIZE") {
        const datos = auditoria.datos;
       const auditoriaCreado = await Auditorias.create(
        {
            nombre_usuario: auditoria.nombre_usuario,
            rol_usuario: auditoria.rol_usuario,
            accion: auditoria.accion,
            datos: {datos}
        },
        {
            fields: [
                "nombre_usuario",
                "rol_usuario",
                "accion",
                "datos"
            ]
        }
       );

       return auditoriaCreado;

      }
    } catch (error) {
      console.log(error.message);
    }
  }

  static async getById(id) {
    return await Auditorias.findByPk(id)
  }
}