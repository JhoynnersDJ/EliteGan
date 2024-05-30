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
        const notificaciones = await Proyectos.findAll({
          attributes: ['id_proyecto', 'nombre_proyecto'],
          where: {
            id_proyecto: id_proyecto
          },
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
  static async editar() {
    try {
      // funcion para las bases de datos de sequelize
      if (database === "SEQUELIZE") {
        // guardar en la base de datos
        const proyectoActualizado = await Proyectos.update(
          {
            tarifa: proyecto.tarifa,
            nombre_proyecto: proyecto.nombre,
            pool_horas: pool_horas,
            fecha_fin: proyecto.fecha_fin,
            pool_horas_contratadas: proyecto.pool_horas
          },
          {
            fields: [
              "tarifa",
              "nombre_proyecto",
              "pool_horas",
              "fecha_fin",
              "pool_horas_contratadas"
            ],
            where: {
              id_proyecto: id_proyecto
            }
          }
        );
        // buscar los tecnicos que ya estaban asignados
        const tecnicosBDSinFormato = await Asignaciones.findAll({
          attributes: [
            'id_asignacion',
            'id_usuario'
          ]
        },
        {
          where: {
            id_proyecto: id_proyecto
          }
        })
        // formato de los datos
        const tecnicosBD = tecnicosBDSinFormato.map((tecnicos) => ({
          id_asignacion: tecnicos.id_asignacion,
          id_usuario: tecnicos.id_usuario
        }));
        // nuevo array con el valor de los tecnicos actualizados
        const tecnicosActualizados = proyecto.tecnicos
        // Asocia los usuarios al proyecto en la tabla asignaciones
        for (const tecnico of tecnicosActualizados) {
          const usuario = await Usuarios.findByPk(tecnico.id_usuario);
          // Comprueba si el tecnico aún existe
          const existeEnBD = tecnicosBD.some(t => t.id_usuario === tecnico.id_usuario);
          if (usuario && existeEnBD) {
            // Si no existe en la base de datos, lo agrega
            await Asignaciones.create({
              id_usuario: tecnico.id_usuario,
              id_proyecto: id_proyecto
            })
          }
        }
      // Desasocia los usuarios que ya no están en el proyecto
      for (const tecnico of tecnicosBD) {
        const sigueEnProyecto = tecnicosActualizados.some(t => t.id_usuario === tecnico.id_usuario);
        if (!sigueEnProyecto) {
          // Si ya no está en este proyecto
          await Asignaciones.update({
            status: false
          },{
            where: {
              id_usuario: tecnico.id_usuario,
              id_proyecto: id_proyecto
            },
            fields:[
              'status'
            ]
          })
        }
      }
        return proyectoActualizado;
      }
    } catch (error) {
      console.log(error.message);
    }
  }
}