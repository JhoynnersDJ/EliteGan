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
import { sendEmail } from "../../../middlewares/sendEmail.js";
import { ResponsableClienteReplica } from "../../responsables_clientes/model/responsable_clienteModel.js";
import date from "date-and-time";

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
          pool_horas_contratadas: formatearMinutos(
            proyecto.pool_horas_contratadas
          ),
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
          pool_horas_contratadas: formatearMinutos(
            proyecto.pool_horas_contratadas
          ),
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
          pool_horas_contratadas: formatearMinutos(
            proyecto.pool_horas_contratadas
          ),
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

  // buscar los proyectos segun una fecha de finalizacion
  static async findProyectoByFechaFin(fecha_fin) {
    try {
      // funcion para las bases de datos de sequelize
      if (database === "SEQUELIZE") {
        // buscar todos los proyectos en la base de datos segun su fecha de finalizacion
        const proyectos = await Proyectos.findAll({
          attributes: [
            "id_proyecto",
            "fecha_fin"
          ],
          where: { fecha_fin },
        });
        return proyectos;
      }
    } catch (error) {
      console.log(error.message);
    }
  }
  // registra en la base de datos
  static async create(proyecto) {
    try {
      // funcion para las bases de datos de sequelize
      if (database === "SEQUELIZE") {
        // guardar en la base de datos
        const proyectoCreado = await Proyectos.create(
          {
            tarifa: proyecto.tarifa,
            nombre_proyecto: proyecto.nombre,
            status: proyecto.status,
            fecha_inicio: proyecto.fecha_inicio,
            id_responsable_cliente: proyecto.responsable_cliente,
            pool_horas: proyecto.pool_horas,
            fecha_fin: proyecto.fecha_fin,
            pool_horas_contratadas: proyecto.pool_horas
          },
          {
            fields: [
              "tarifa",
              "nombre_proyecto",
              "status",
              "fecha_inicio",
              "id_responsable_cliente",
              "pool_horas",
              "fecha_fin",
              "pool_horas_contratadas",
            ],
          }
        );
        // Asocia los usuarios al proyecto en la tabla asignaciones
        for (const tecnico of proyecto.tecnicos) {
          const usuario = await Usuarios.findByPk(tecnico.id_usuario);
          if (usuario) {
            await proyectoCreado.addUsuario(usuario);
          }
        }
        return proyectoCreado;
      }
    } catch (error) {
      console.log(error.message);
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
                  attributes: ["nombre_servicio","id_servicio"],
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
                ["cedula", "cedula"],
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
          const total_tareas = proyecto.tareas.reduce((accumulator, tarea) => {
            // Verificar si la tarea ya existe en total_tareas
            const existingTaskIndex = accumulator.findIndex(
              (item) => item.nombre_servicio === tarea.servicio.nombre_servicio
            );
            if (existingTaskIndex !== -1) {
              // Si la tarea ya existe, sumar las horas
              accumulator[existingTaskIndex].tiempo_total += tarea.tiempo_total;
            } else {
              // Si la tarea no existe, agregarla al array
              accumulator.push({
                nombre_servicio: tarea.servicio.nombre_servicio,
                tiempo_total: tarea.tiempo_total,
                id_servicio: tarea.servicio.id_servicio
              });
            }

            return accumulator;
          }, []);

          
        
        // formato de los datos
        const formattedProyecto = {
          id_proyecto: proyecto.id_proyecto,
          nombre_proyecto: proyecto.nombre_proyecto,
          tarifa: proyecto.tarifa,
          status: proyecto.status,
          fecha_inicio: proyecto.fecha_inicio,
          fecha_fin: proyecto.fecha_fin,
          pool_horas_contratadas: formatearMinutos(proyecto.pool_horas_contratadas),
          pool_horas:formatearMinutos(proyecto.pool_horas),
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
          cedula_responsable_cliente:
            proyecto.responsables_cliente.dataValues.cedula,
          usuarios: proyecto.usuarios,
          tareas: proyecto.tareas,
          total_horas_tareas: sumaFactor,
          total_tareas: total_tareas,
        };
        return formattedProyecto;
      }
    } catch (error) {
      console.log(error.message);
    }
  }
  // actualizar el status de un proyecto a completado en la base de datos
  static async concretarProyecto(id) {
    try {
      // funcion para las bases de datos de sequelize
      if (database === "SEQUELIZE") {
        // actualizar un proyecto en la base de datos
        const proyecto = await Proyectos.update({
          status: 1
        },{
          where: { id_proyecto: id },
        });
        return proyecto;
      }
    } catch (error) {
      console.log(error.message);
    }
  }
  // enviar correo a un tecnico al momento de crear un proyecto
  static async sendEmailCreate(usuario, proyecto) {
    try {
      const responsable = await ResponsableClienteReplica.findByPk(proyecto.responsable_cliente)
      const asunto = `Nuevo proyecto: ${proyecto.nombre}`
      // formatear fecha
      let fecha_fin = new Date(proyecto.fecha_fin)
      fecha_fin = date.format(fecha_fin, 'DD/MM/YYYY');  
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Título de la Página</title>
            <style>
                body {
                    margin: 0;
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                }
        
                header {
                    background-color: #333;
                    padding-left: 4vh;
                    padding-right: 10vh;
                    padding-top: 2%;
                    padding-bottom: 2%;
                }
        
                h1 {
                    color: white;
                    font-size: 5vh;
                }
        
                h2 {
                    font-weight: bold;
                    margin-left: 5%;
                    margin-top: 10px;
                    font-size: 24px;
                    margin-right: 5%;
                }
        
                p {
                    margin-left: 5%;
                    font-size: 16px;
                    line-height: 1.5;
                    margin-right: 5%;
                    margin-top: 20px;
                    font-size: 18px;
                    color: #333;
                    line-height: 1.5;
                    text-align: justify;
                }
        
                .token-container {
                    background-color: #666;
                    color: #fff;
                    padding: 10px;
                    border-radius: 5px;
                    font-size: 18px;
                    margin-top: 10px;
                    text-align: center;
                }        
                .container {
                      max-width: 900px;
                      margin: 0 auto;
                      background-color: #fff;
                      border-radius: 5px;
                      box-shadow: 0 0 10px #f2f2f2;
                    }
                .span1 {
                    color: orange
                }
            </style>
        </head>
        <body style="padding: 20px;">
            <div class="container">
                <header>
                    <h1>Hormiwatch<h1>
                </header>
                <h2>¡Tienes un nuevo proyecto!</h2>
                <p>Hola <span class="span1">${usuario.nombre} ${usuario.apellido}</span>!</p>
                <p>
                    Ha sido agregado al proyecto <span class="span1">${proyecto.nombre}</span> del cliente <span class="span1">${responsable.nombre_cliente}</span>, cuyo responsable es <span class="span1">${responsable.nombre}</span>. Finaliza el <span class="span1">${fecha_fin}</span>.       
                </p>
            </div>
            <p>pie de pagina</p>
        </body>
        </html>   
      `
      await sendEmail(htmlContent,usuario.email, asunto);
      console.log('Correo enviado a: ' + usuario.nombre + " " +usuario.apellido)
    } catch (error) {
      console.log(error.message);
    }
  }
}
