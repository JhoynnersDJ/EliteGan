import { where } from 'sequelize';
import {
  Proyectos,
  ResponsablesClienteR,
  ClientesR,
  Usuarios,
  Asignaciones,
  Tareas,
  Servicios,
} from "../../../database/hormiwatch/asociaciones.js";
// import { user } from '../../usuarios/model/UserModel.js';
import { formatearMinutos } from "../libs/pool_horas.js";
const database = process.env.SELECT_DB;

export class Proyecto {
  constructor(
    nombre,
    tarifa,
    status,
    pool_horas,
    fecha_inicio,
    fecha_fin,
    responsable_cliente,
    tecnicos
  ) {
    this.nombre = nombre;
    this.tarifa = tarifa;
    this.pool_horas = pool_horas;
    this.fecha_inicio = fecha_inicio;
    this.fecha_fin = fecha_fin;
    this.responsable_cliente = responsable_cliente;
    this.tecnicos = tecnicos;
    this.status = status;
  }

  // devuelve todos los registros
  static async findAll() {
    try {
      // funcion para las bases de datos de sequelize
      if (database === "SEQUELIZE") {
        const proyectos = await Proyectos.findAll({
          include: [
            {
              model: ResponsablesClienteR,
              attributes: [["nombre_responsable_cliente", "nombre"]],
              include: [
                {
                  model: ClientesR,
                  attributes: [
                    ["id_cliente", "id"],
                    ["nombre_cliente", "nombre"],
                  ],
                },
              ],
            },
            {
              model: Usuarios,
              attributes: [["id_usuario", "id"], "nombre", "apellido", "email"],
              through: {
                model: Asignaciones,
                attributes: [],
              },
            },
          ],
        });
        // formato de los datos
        const formattedProyectos = proyectos.map((proyecto) => ({
          id_proyecto: proyecto.id_proyecto,
          nombre: proyecto.nombre_proyecto,
          tarifa: proyecto.tarifa,
          status: proyecto.status,
          fecha_inicio: proyecto.fecha_inicio,
          fecha_fin: proyecto.fecha_fin,
          pool_horas: formatearMinutos(proyecto.pool_horas),
          id_responsable_cliente: proyecto.id_responsable_cliente,
          nombre_responsable_cliente:
            proyecto.responsables_cliente.dataValues.nombre,
          id_cliente: proyecto.responsables_cliente.cliente.dataValues.id,
          nombre_cliente:
            proyecto.responsables_cliente.cliente.dataValues.nombre,
          usuarios: proyecto.usuarios,
        }));
        return formattedProyectos;
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  // devuelve todos los registros segun el usuario
  static async findByUser(id) {
    try {
      // funcion para las bases de datos de sequelize
      if (database === "SEQUELIZE") {
        const proyectos = await Proyectos.findAll({
          where: {
            status: 0,
          },
          include: [
            {
              model: ResponsablesClienteR,
              attributes: [["nombre_responsable_cliente", "nombre"]],
              include: [
                {
                  model: ClientesR,
                  attributes: [
                    ["id_cliente", "id"],
                    ["nombre_cliente", "nombre"],
                  ],
                },
              ],
            },
            {
              model: Usuarios,
              attributes: [],
              through: {
                model: Asignaciones,
                attributes: [],
              },
              where: { id_usuario: id },
            },
            {
              model: Usuarios,
              as: "tecnicos",
              attributes: [["id_usuario", "id"], "nombre", "apellido", "email"],
              through: {
                model: Asignaciones,
                attributes: [],
              },
            },
          ],
        });
        // formato de los datos
        const formattedProyectos = proyectos.map((proyecto) => ({
          id_proyecto: proyecto.id_proyecto,
          nombre: proyecto.nombre_proyecto,
          tarifa: proyecto.tarifa,
          status: proyecto.status,
          fecha_inicio: proyecto.fecha_inicio,
          fecha_fin: proyecto.fecha_fin,
          pool_horas: formatearMinutos(proyecto.pool_horas),
          id_responsable_cliente: proyecto.id_responsable_cliente,
          nombre_responsable_cliente:
            proyecto.responsables_cliente.dataValues.nombre,
          id_cliente: proyecto.responsables_cliente.cliente.dataValues.id,
          nombre_cliente:
            proyecto.responsables_cliente.cliente.dataValues.nombre,
          usuarios: proyecto.tecnicos,
        }));
        return formattedProyectos;
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  // devuelve un unico registro segun su primary key
  static async findByPk(id) {
    try {
      // funcion para las bases de datos de sequelize
      if (database === "SEQUELIZE") {
        const proyecto = await Proyectos.findByPk(id, {
          include: [
            {
              model: ResponsablesClienteR,
              attributes: [["nombre_responsable_cliente", "nombre"]],
              include: [
                {
                  model: ClientesR,
                  attributes: [
                    ["id_cliente", "id"],
                    ["nombre_cliente", "nombre"],
                  ],
                },
              ],
            },
            {
              model: Usuarios,
              attributes: [["id_usuario", "id"], "nombre", "apellido", "email"],
              through: {
                model: Asignaciones,
                attributes: [],
              },
            },
          ],
        });
        // formato de los datos
        const formattedProyecto = {
          id_proyecto: proyecto.id_proyecto,
          nombre: proyecto.nombre_proyecto,
          tarifa: proyecto.tarifa,
          status: proyecto.status,
          fecha_inicio: proyecto.fecha_inicio,
          fecha_fin: proyecto.fecha_fin,
          pool_horas: formatearMinutos(proyecto.pool_horas),
          id_responsable_cliente: proyecto.id_responsable_cliente,
          nombre_responsable_cliente:
            proyecto.responsables_cliente.dataValues.nombre,
          id_cliente: proyecto.responsables_cliente.cliente.dataValues.id,
          nombre_cliente:
            proyecto.responsables_cliente.cliente.dataValues.nombre,
          usuarios: proyecto.usuarios,
        };
        return formattedProyecto;
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  // devuelve un unico registro segun su nombre
  static async findOneName(nombre, id_responsable_cliente) {
    try {
      // funcion para las bases de datos de sequelize
      if (database === "SEQUELIZE") {
        const proyecto = await Proyectos.findOne({
          attributes: ["nombre_proyecto"],
          where: {
            nombre_proyecto: nombre,
            id_responsable_cliente,
          },
        });
        return proyecto;
      }
    } catch (error) {
      console.log(error.message);
    }
  }

    // registra en la base de datos
    static async create(proyecto){
        try {
            // funcion para las bases de datos de sequelize
            if (database === "SEQUELIZE") {
                // guardar en la base de datos
                const proyectoCreado = await Proyectos.create({ 
                    tarifa: proyecto.tarifa,
                    nombre_proyecto: proyecto.nombre,
                    status: proyecto.status,
                    fecha_inicio: proyecto.fecha_inicio,
                    id_responsable_cliente: proyecto.responsable_cliente,
                    pool_horas: proyecto.pool_horas,
                    fecha_fin: proyecto.fecha_fin,
                }, { fields: [
                    'tarifa',
                    'nombre_proyecto',
                    'status',
                    'fecha_inicio',
                    'id_responsable_cliente',
                    'pool_horas',
                    'fecha_fin',]
                })
                // Asocia los usuarios al proyecto en la tabla asignaciones
                for (const tecnico of proyecto.tecnicos) {
                    const usuario = await Usuarios.findByPk(tecnico.id_usuario);
                    if (usuario) {
                        await proyectoCreado.addUsuario(usuario);
                    }
                }
                return proyectoCreado
            }
        } catch (error) {
            console.log(error.message)
        }
    }

  // elimina un registro en la base de datos
  static async delete(id) {
    try {
      // funcion para las bases de datos de sequelize
      if (database === "SEQUELIZE") {
        // guardar en la base de datos
        const proyecto = await Proyectos.destroy({
          where: { id_proyecto: id },
        });
        return proyecto;
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  static async findByPkPDF(id) {
    try {
      // funcion para las bases de datos de sequelize
      if (database === "SEQUELIZE") {
        const proyecto = await Proyectos.findByPk(id, {
          include: [
            {
              model: Tareas,
              attributes: [
                "id_tarea",
                "fecha",
                "hora_inicio",
                "hora_fin",
                "tiempo_total",
                "total_tarifa",
                "factor_tiempo_total",
                "status",
              ],
              include: [
                {
                  model: Servicios,
                  attributes: ["nombre_servicio"],
                },
              ],
            },
            {
              model: ResponsablesClienteR,
              attributes: [
                ["nombre_responsable_cliente", "nombre"],
                ["cargo", "cargo"],
                ["departamento", "departamento"],
                ["telefono", "telefono"],
              ],
              include: [
                {
                  model: ClientesR,
                  attributes: [
                    ["id_cliente", "id"],
                    ["nombre_cliente", "nombre_cliente"],
                  ],
                },
              ],
            },
            {
              model: Usuarios,
              attributes: [
                ["id_usuario", "id"],
                "nombre",
                "apellido",
                "email",
                "cedula",
              ],
              through: {
                model: Asignaciones,
                attributes: [],
              },
            },
          ],
        });
        var sumaFactor = 0;
        if (proyecto.tareas.length !== 0) {
          proyecto.tareas.forEach((tarea) => {
            sumaFactor += tarea.factor_tiempo_total;
          });
        }
        // formato de los datos
        const formattedProyecto = {
          id_proyecto: proyecto.id_proyecto,
          nombre_proyecto: proyecto.nombre_proyecto,
          tarifa: proyecto.tarifa,
          status: proyecto.status,
          fecha_inicio: proyecto.fecha_inicio,
          fecha_fin: proyecto.fecha_fin,
          pool_horas: formatearMinutos(proyecto.pool_horas_contratadas),
          id_responsable_cliente: proyecto.id_responsable_cliente,
          nombre_responsable_cliente:
            proyecto.responsables_cliente.dataValues.nombre,
          cargo_responsable_cliente:
            proyecto.responsables_cliente.dataValues.cargo,
          departamento_responsable_cliente:
            proyecto.responsables_cliente.dataValues.departamento,
          telefono_responsable_cliente:
            proyecto.responsables_cliente.dataValues.telefono,
          id_cliente: proyecto.responsables_cliente.cliente.dataValues.id,
          nombre_cliente:
            proyecto.responsables_cliente.cliente.dataValues.nombre_cliente,
          usuarios: proyecto.usuarios,
          tareas: proyecto.tareas,
          total_horas_tareas: sumaFactor,
        };

        return formattedProyecto;
      }
    } catch (error) {
      console.log(error.message);
    }
  }
}
