import {
  Proyectos,
  ResponsablesClienteR,
  ClientesR,
  Usuarios,
  Asignaciones,
  Tareas,
  Servicios,
} from "../../../database/hormiwatch/asociaciones.js";
import { Metricas } from "../../metricas/model/metricasModel.js";
// import { user } from '../../usuarios/model/UserModel.js';
import { formatearMinutos } from "../libs/pool_horas.js";
import { sendEmail } from "../../../middlewares/sendEmail.js";
import { ResponsableClienteReplica } from "../../responsables_clientes/model/responsable_clienteModel.js";
import date from "date-and-time";
import { Op } from "sequelize";

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
              attributes: ["id_usuario", "nombre", "apellido", "email"],
              through: {
                model: Asignaciones,
                attributes: [],
                where: {
                  [Op.or]:[
                    {status: null},
                    {status: 1},
                    {status: true}
                  ]
                }
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
          pool_horas_contratadas: formatearMinutos(proyecto.pool_horas_contratadas),
          horas_trabajadas: formatearMinutos(proyecto.horas_trabajadas),
          id_responsable_cliente: proyecto.id_responsable_cliente,
          nombre_responsable_cliente: proyecto.responsables_cliente.dataValues.nombre,
          id_cliente: proyecto.responsables_cliente.cliente.dataValues.id,
          nombre_cliente: proyecto.responsables_cliente.cliente.dataValues.nombre,
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
              attributes: ["id_usuario", "nombre", "apellido", "email"],
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
          pool_horas_contratadas: formatearMinutos(proyecto.pool_horas_contratadas),
          horas_trabajadas: formatearMinutos(proyecto.horas_trabajadas),
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
              attributes: ["id_usuario", "nombre", "apellido", "email"],
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
          horas_trabajadas: formatearMinutos(proyecto.horas_trabajadas),
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
  // actualiza en la base de datos
  static async editar(proyecto, pool_horas, id_proyecto) {
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
                "id_usuario",
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
          let tecnicos = [];
          for  (const usuario of proyecto.usuarios ) {
            const allTask = await Metricas.tareasByTecnico(usuario.id_usuario)
            const allhours= await Metricas.totalFactorByUser(usuario.id_usuario)            
              const jkl ={
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                cedula: usuario.cedula,
                email: usuario.email,
                allTask: allTask,
                allhours: allhours
              };             
              tecnicos.push(jkl)
          }
          /*const tecnicos2 = proyecto.usuarios.forEach(async (tecnicos, usuario) => {
            const allTask = await Metricas.totalFactorByUser(usuario.id_usuario)
            const allhours= await Metricas.totalFactorByUser(usuario.id_usuario)            
              const jkl ={
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                cedula: usuario.cedula,
                email: usuario.email,
                allTask: allTask,
                allhours: allhours
              };              
              tecnicos.push(jkl)
              return tecnicos
          }, []);*/
          //console.log(tecnicos)
        
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
          tecnicos: tecnicos
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
                  background-color: #00A4D3;
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
                  color: #00A4D3
              }
              .piePagina {
                  background-color: #00A4D3;
                  color: white;
                  padding: 10px;
                  text-align: center;
              }
              .piePagina p {
                  color: white;
              }
          li {
              list-style-type: none;
          }
          ul span {
              font-weight: bold;
              color : #00A4D3;
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
                  Ha sido agregado a un proyecto 
              </p>
              <p style="text-align: center; font-weight: bold;">
                  Datos del Proyecto
                  </p> 
                  <li>
                      <ul> <span>-</span> Nombre del Proyecto: <span>${proyecto.nombre}</span>
                      </ul>
                      <ul>
                          <span>-</span> Fecha de Inicio: <span>${proyecto.fecha_inicio}</span> 
                          - Fecha de Fin: <span>${proyecto.fecha_fin}</span>
                      </ul>
                      <ul>
                          <span>-</span> Cliente del Proyecto: <span>${responsable.nombre_cliente}</span>
                      </ul>
                      <ul>
                          <span>-</span> Responsable del Proyecto: <span>${responsable.nombre}</span>
                      </ul>
                      <ul>
                          <span>-</span> Pool de Horas del Proyecto: <span>${formatearMinutos(proyecto.pool_horas)}</span>
                      </ul>
                  </li>
              <footer class="piePagina">
                  <p>Este mensaje fue enviado automáticamente por el sistema. Por favor, no responda a este correo.</p>
          </div>
      </body>
      </html>  
      `
      await sendEmail(htmlContent,usuario.email, asunto);
      console.log('Correo de creación de proyecto enviado a: ' + usuario.nombre + " " +usuario.apellido)
    } catch (error) {
      console.log(error.message);
    }
  }
  // enviar correo a un tecnico al momento de editar un proyecto
  static async sendEmailUpdate(usuario, proyecto, pool_horas) {
    try {
      const responsable = await ResponsableClienteReplica.findByPk(proyecto.responsable_cliente)
      const asunto = `Proyecto editado: ${proyecto.nombre}`
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
                  background-color: #00A4D3;
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
                  color: #00A4D3
              }
              .piePagina {
                  background-color: #00A4D3;
                  color: white;
                  padding: 10px;
                  text-align: center;
              }
              .piePagina p {
                  color: white;
              }
          li {
              list-style-type: none;
          }
          ul span {
              font-weight: bold;
              color : #00A4D3;
          }
          </style>
      </head>
      <body style="padding: 20px;">
          <div class="container">
              <header>
                  <h1>Hormiwatch<h1>
              </header>
              <h2>¡Un proyecto ha sido modificado!</h2>
              <p>Hola <span class="span1">${usuario.nombre} ${usuario.apellido}</span>!</p>
              <p>
                  Un proyecto donde participa ha sido modificado 
              </p>
              <p style="text-align: center; font-weight: bold;">
                  Datos del Proyecto
                  </p> 
                  <li>
                      <ul> <span>-</span> Nombre del Proyecto: <span>${proyecto.nombre}</span>
                      </ul>
                      <ul>
                          <span>-</span> Fecha de Inicio: <span>${proyecto.fecha_inicio}</span> 
                          - Fecha de Fin: <span>${proyecto.fecha_fin}</span>
                      </ul>
                      <ul>
                          <span>-</span> Cliente del Proyecto: <span>${responsable.nombre_cliente}</span>
                      </ul>
                      <ul>
                          <span>-</span> Responsable del Proyecto: <span>${responsable.nombre}</span>
                      </ul>
                      <ul>
                          <span>-</span> Pool de Horas Contradas del Proyecto: <span>${formatearMinutos(proyecto.pool_horas)}</span>
                      </ul>
                      <ul>
                          <span>-</span> Pool de Horas del Proyecto: <span>${formatearMinutos(pool_horas)}</span>
                      </ul>
                  </li>
              <footer class="piePagina">
                  <p>Este mensaje fue enviado automáticamente por el sistema. Por favor, no responda a este correo.</p>
          </div>
      </body>
      </html>    
      `
      await sendEmail(htmlContent, usuario.email, asunto);
      console.log('Correo de editar proyecto enviado a: ' + usuario.nombre + " " +usuario.apellido)
    } catch (error) {
      console.log(error.message);
    }
  }
}
