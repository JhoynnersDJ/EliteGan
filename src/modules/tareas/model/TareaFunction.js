import { Proyectos, Usuarios } from "../../../database/hormiwatch/asociaciones.js";
import { Servicios } from "../../../database/hormiwatch/asociaciones.js";
import { Tareas } from "../../../database/hormiwatch/asociaciones.js";
import tarea from "./TareaModel.js";
import {user} from "../../usuarios/model/UserModel.js"
import { calcularDiferenciaDeTiempo, calculartarifa } from '../libs/Tarifa.js'
import "dotenv/config";

const dbSelect = process.env.SELECT_DB;

async function save(tarea) {
  if (dbSelect == "SEQUELIZE") {
    const isCompleted = tarea.status === true ? "C" : "P";
    return await Tareas.create(
      {
        fecha: new Date(tarea.fecha),
        hora_inicio: tarea.hora_inicio,
        hora_fin: tarea.hora_fin,
        tiempo_total: tarea.tiempo_total,
        factor_tiempo_total: tarea.factor_tiempo_total,
        id_proyecto: tarea.id_proyecto,
        id_servicio: tarea.id_servicio,
        total_tarifa: tarea.total_tarifa,
        status: isCompleted,
        id_usuario: tarea.id_usuario
      },
      {
        fields: [
          "fecha",
          "hora_inicio",
          "hora_fin",
          "tiempo_total",
          "factor_tiempo_total",
          "id_proyecto",
          "id_servicio",
          "total_tarifa",
          "status",
          "id_usuario"
        ],
      }
    );
    
  }
  return null;
}

async function findProjectById(id) {
  if (dbSelect == "SEQUELIZE") {
    const project = await Proyectos.findByPk(id);
    if (!project) return null;
    return project;
  }
  return null;
}

async function restPoolProjectById(id, horas) {
  if (dbSelect == "SEQUELIZE") {
    const project = await Proyectos.findByPk(id);
    if (!project) return null;
    const result = project.pool_horas - Number(horas);
    const resultHour = project.horas_trabajadas + parseFloat(horas);
    project.pool_horas = result;
    project.horas_trabajadas = resultHour;
    return project.save();
  }
  return null;
}

async function findServiceById(id) {
  if (dbSelect == "SEQUELIZE") {
    const serviceFound = await Servicios.findByPk(id);
    if (!serviceFound) return null;
    return serviceFound;
  }
  return null;
}

async function calulateTotalTime(dt1, dt2) {
  var diff = (dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60 * 60;
  return Math.abs(Math.round(diff));
}

async function findTaskByProjectId(id) {
  if (dbSelect == "SEQUELIZE") {
    const tasks = await Tareas.findAll({
      where: {
        id_proyecto: id,
      },
      order: [['fecha', 'DESC']],
      include: [
        {
          model: Servicios,
          attributes: ["nombre_servicio"],
        },
        {
          model: Usuarios,
          attributes: ["id_usuario","nombre", "apellido"],
        },
      ],
    });

    if (tasks.length === 0 || !tasks) return [];
    let newTasks = [];
    tasks.forEach((task) =>{
      var formattedTask = {
        id_tarea:task.dataValues.id_tarea,
        fecha:task.dataValues.fecha,
        hora_inicio:  task.dataValues.hora_inicio,
        hora_fin:  task.dataValues.hora_fin,
        tiempo_total:  calcularDiferenciaDeTiempo(task.hora_inicio, task.hora_fin).tiempo_formateado,
        factor_tiempo_total:  task.dataValues.factor_tiempo_total,
        id_proyecto:  task.dataValues.id_proyecto,
        id_servicio:  task.dataValues.id_servicio,
        total_tarifa:  task.dataValues.total_tarifa,
        status:  task.dataValues.status,
        nombre_servicio:  task.dataValues.servicio.dataValues.nombre_servicio,
        nombre_tecnico: `${task.dataValues.usuario.nombre} ${task.dataValues.usuario.apellido}`,
        id_usuario: task.dataValues.id_usuario
      }
      newTasks.push(formattedTask)}
    );
    return newTasks;
  }
  return null;
}

async function findUserByProjectId(id) {
  if (dbSelect == "SEQUELIZE") {
    const projects = await Proyectos.findAll({
      where: {
        id_proyecto: id,
      },
      include: [        
        {
          model: Usuarios,
          attributes: ["id_usuario","nombre", "apellido"],
        },
      ],
    });
    if (projects[0].usuarios.length === 0 || !projects[0].usuarios) return [];
    let newTasks = [];
    projects[0].usuarios.forEach((task) =>{
      var formattedTask = {
        id_usuario: task.id_usuario
      }
      newTasks.push(formattedTask)}
    );
    return newTasks;
  }
  return null;
}

async function completeTaskByProjectId(id) {
  if (dbSelect == "SEQUELIZE") {
    const tasks = await Tareas.findAll({
      where: {
        id_proyecto: id,
      },      
    });
    if (tasks.length === 0 || !tasks) return [];
    
    tasks.forEach((task) =>
      {task.status = "C";
      task.save()}
    );
    
    return true
  }
  return null;
}

async function deleteTasksById(id) {
  if (dbSelect == "SEQUELIZE") {
    const task = await Tareas.findByPk(id);
    if (!task) return null;

    const project = await Proyectos.findByPk(task.dataValues.id_proyecto);
    if (!project) return null;

    const plus = project.pool_horas + (Number(task.factor_tiempo_total)*60);
    const minus = project.horas_trabajadas - (parseFloat(task.factor_tiempo_total)*60);
    console.log(minus)
    project.pool_horas = plus;
    project.horas_trabajadas = minus;
    project.save();

    return await Tareas.destroy({
      where: { id_tarea: id },
    });
  }
  return null;
}

async function getTasksById(id) {
  if (dbSelect == "SEQUELIZE") {
    const task = await Tareas.findByPk(id);
    if (!task) return null;
    return new tarea(
      task.id_tarea,
      task.fecha,
      task.hora_inicio,
      task.hora_fin,
      task.tiempo_total,
      task.factor_tiempo_total,
      task.id_proyecto,
      task.id_servicio,
      task.total_tarifa,
      task.status,
      null,
      task.id_usuario
    )
  }
  return null;
}

async function completeTasksById(id) {
  if (dbSelect == "SEQUELIZE") {
    const task = await Tareas.findByPk(id);
    task.status = "C";
    task.save();
    if (!task) return null;
    return new tarea(
      task.id_tarea,
      task.fecha,
      task.hora_inicio,
      task.hora_fin,
      task.tiempo_total,
      task.factor_tiempo_total,
      task.id_proyecto,
      task.id_servicio,
      task.total_tarifa,
      task.status,
      null,
      task.id_usuario
    )
  }
  return null;
}

async function updateTaskById(task) {
  if (dbSelect == "SEQUELIZE") {
    const taskFound = await Tareas.findByPk(task.id_tarea);
    /*if (task.status){
      taskFound.status = "C";
    }else{
      taskFound.status = "P";
    }*/
    taskFound.status = task.status;
    taskFound.id_servicio = task.id_servicio;
    taskFound.save()
    return taskFound;
    /*return await Tareas.update(
      {        
        id_servicio: task.id_service, status: task.status        
      },
      {
        fields: [ 'id_servicio', 'status' ],
        where: { id_tarea: task.id_tarea }
      })*/
  }
  return null;
}

async function findTaskByProjectAndUserId(id, id_user) {
  if (dbSelect == "SEQUELIZE") {
    const tasks = await Tareas.findAll({
      where: {
        id_proyecto: id,
        id_usuario: id_user,
      },
      include: [
        {
          model: Servicios,
          attributes: ["nombre_servicio"],
        },
        {
          model: Usuarios,
          attributes: ["nombre", "apellido"],
        },
      ],
    });

    if (tasks.length === 0 || !tasks) return [];
    let newTasks = [];
    tasks.forEach((task) =>{
      var formattedTask = {
        id_tarea:task.dataValues.id_tarea,
        fecha:task.dataValues.fecha,
        hora_inicio:  task.dataValues.hora_inicio,
        hora_fin:  task.dataValues.hora_fin,
        tiempo_total:  calcularDiferenciaDeTiempo(task.hora_inicio, task.hora_fin).tiempo_formateado,
        factor_tiempo_total:  task.dataValues.factor_tiempo_total,
        id_proyecto:  task.dataValues.id_proyecto,
        id_servicio:  task.dataValues.id_servicio,
        total_tarifa:  task.dataValues.total_tarifa,
        status:  task.dataValues.status,
        nombre_servicio:  task.dataValues.servicio.dataValues.nombre_servicio,
        nombre_tecnico: `${task.dataValues.usuario.nombre} ${task.dataValues.usuario.apellido}`
      }
      newTasks.push(formattedTask)}
    );
    return newTasks;
  }
  return null;
}

async function getUserById(id) {
  if (dbSelect == "SEQUELIZE"){
    return await user.findOneById(id);
  }
  return null;
}

// enviar notificacion al correo al momento de crear una tarea
async function sendEmailCreate(tarea){
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



export default class tareaFunction {
  static save(tarea) {
    return save(tarea);
  }
  static findProjectById(id) {
    return findProjectById(id);
  }
  static restPoolProjectById(id, horas) {
    return restPoolProjectById(id, horas);
  }
  static findServiceById(id) {
    return findServiceById(id);
  }
  static calulateTotalTime(dt1, dt2) {
    return calulateTotalTime(dt1, dt2);
  }
  static findTaskByProjectId(id) {
    return findTaskByProjectId(id);
  }
  static deleteTasksById(id) {
    return deleteTasksById(id);
  }
  static getTasksById(id) {
    return getTasksById(id);
  }
  static updateTaskById(task) {
    return updateTaskById(task);
  }
  static getUserById(id) {
    return getUserById(id);
  }
  static completeTaskByProjectId(id) {
    return completeTaskByProjectId(id);
  }
  static completeTasksById(id) {
    return completeTasksById(id);
  }
  static findTaskByProjectAndUserId(id, id_user) {
    return findTaskByProjectAndUserId(id, id_user);
  }
  static findUserByProjectId(id) {
    return findUserByProjectId(id);
  }
}
