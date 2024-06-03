import { Proyectos, Usuarios, Notificaciones } from "../../../database/hormiwatch/asociaciones.js";


const database = process.env.SELECT_DB;

export class Notificacion {
  // // devuelve todos los registros
  static async findAll() {
    try {
      // funcion para las bases de datos de sequelize
      if (database === "SEQUELIZE") {
        const notificaciones = await Proyectos.findAll({
          attributes: ['id_proyecto', 'nombre_proyecto'],
          include: [
            {
              model: Usuarios,
              attributes: ["id_usuario", "nombre", "apellido", "email"],
              through: {
                model: Notificaciones,
                attributes: [],
                // where: {
                //   [Op.or]:[
                //     {status: null},
                //     {status: 1},
                //     {status: true}
                //   ]
                // }
              },
            }
          ],
        });
        return notificaciones;
      }
    } catch (error) {
      console.log(error.message);
    }
  }
  // // devuelve todos segun el proyecto
  static async findByProject(id_proyecto) {
    try {
      // funcion para las bases de datos de sequelize
      if (database === "SEQUELIZE") {
        const notificaciones = await Proyectos.findByPk(id_proyecto,{
          attributes: ['id_proyecto', 'nombre_proyecto'],
          // where: {
          //   id_proyecto: id_proyecto
          // },
          include: [
            {
              model: Usuarios,
              attributes: ["id_usuario", "nombre", "apellido", "email"],
              through: {
                model: Notificaciones,
                attributes: [],
              },
            }
          ],
        });
        return notificaciones;
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  // actualiza en la base de datos
  static async actualizarLista(id_proyecto, usuarios) {
    try {
      // funcion para las bases de datos de sequelize
      if (database === "SEQUELIZE") {
        // actualizar la lista de notificaciones
        const usuariosBdSinFormatear = await Notificacion.findByProject(id_proyecto)
        const usuariosBdId = usuariosBdSinFormatear.usuarios
        // formato de los datos
        const usuariosBd = usuariosBdId.map((user) => ({
          id_usuario: user.id_usuario
        }));
        console.log(usuariosBd)
        // Asocia los usuarios al proyecto en la tabla notificaciones
        for (const usuario of usuarios) {
          const userExist = await Usuarios.findByPk(usuario.id_usuario);
          // Comprueba si el usuario aún existe
          const existeEnBD = usuariosBd.some(t => t.id_usuario === usuario.id_usuario);
          if (userExist && existeEnBD) {
            // Si no existe en la base de datos, lo agrega
            await Notificaciones.create({
              id_usuario: usuario.id_usuario,
              id_proyecto: id_proyecto
            })
          }else{
            // Si no existe en la base de datos, lo agrega
            await Notificaciones.create({
              id_usuario: usuario.id_usuario,
              id_proyecto: id_proyecto
            })
          }
        }
      // Desasocia los usuarios que ya reciben notificaciones
      for (const usuario of usuariosBd) {
        const sigueEnNotificaciones = usuarios.some(t => t.id_usuario === usuario.id_usuario);
        if (!sigueEnNotificaciones) {
          // Si ya no está en este proyecto
          await Notificaciones.destroy({
            where: {
              id_usuario: usuario.id_usuario,
              id_proyecto: id_proyecto
            }
          })
        }
      }
      }
    } catch (error) {
      console.log(error.message);
    }
  }
}