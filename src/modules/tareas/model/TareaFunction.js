import { Proyectos, Usuarios } from "../../../database/hormiwatch/asociaciones.js";
import { Proyecto } from "../../proyectos/model/ProyectoModel.js"
import { Servicio } from "../../servicios/model/servicioModel.js"
import { Servicios } from "../../../database/hormiwatch/asociaciones.js";
import { Tareas } from "../../../database/hormiwatch/asociaciones.js";
import tarea from "./TareaModel.js";
import {user} from "../../usuarios/model/UserModel.js"
import { calcularDiferenciaDeTiempo, calculartarifa } from '../libs/Tarifa.js'
import { sendEmail } from "../../../middlewares/sendEmail.js";
import { formatearMinutos } from "../../proyectos/libs/pool_horas.js";
import {AuditoriaController} from "../../auditoria/controllers/AuditoriaController.js";
import "dotenv/config";

const dbSelect = process.env.SELECT_DB;

async function save(tarea) {
  if (dbSelect == "SEQUELIZE") {
    const isCompleted = tarea.status === true ? "C" : "P";
    const datos2 = await Tareas.create(
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
        id_usuario: tarea.id_usuario,
        descripcion: tarea.descripcion
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
          "id_usuario",
          "descripcion"
        ],
      }
    );
    const id_tarea1 = datos2.dataValues.id_tarea
    const datos = await Tareas.findByPk(id_tarea1);
    console.log("datos")
    console.log(datos)
    console.log("datos")
    //AuditoriaController.resgistrarAccion("crear", "tarea", datos.dataValues)
    return datos;
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
    var result;
    if(project.facturable){
      result = project.pool_horas - Number(horas);
    }else{
      result = project.pool_horas + Number(horas);
    }
    
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
        id_usuario: task.dataValues.id_usuario,
        descripcion: task.dataValues.descripcion
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
    var plus = 0;
    if(project.facturable){
      plus = project.pool_horas + (Number(task.factor_tiempo_total)*60);
    }else{
      plus = project.pool_horas - (Number(task.factor_tiempo_total)*60);
    }
    const minus = project.horas_trabajadas - (parseFloat(task.factor_tiempo_total)*60);    
    project.pool_horas = plus;
    project.horas_trabajadas = minus;
    project.save();

    return await Tareas.destroy({
      where: { id_tarea: id },
    });
  }
  return null;
}

async function updatePlusProjectById(id, factor_tiempo_total) {
  if (dbSelect == "SEQUELIZE") {
    const task = await Tareas.findByPk(id);
    if (!task) return null;

    const project = await Proyectos.findByPk(task.dataValues.id_proyecto);
    var plus;
    if (!project) return null;
    if(project.facturable){
      plus = project.pool_horas + (Number(factor_tiempo_total)*60);
    } else{
      plus = project.pool_horas - (Number(factor_tiempo_total)*60);
    }
    
    const minus = project.horas_trabajadas - (parseFloat(factor_tiempo_total)*60);    
    project.pool_horas = plus;
    project.horas_trabajadas = minus;
    return project.save();

    
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
    taskFound.hora_inicio = task.hora_inicio;
    taskFound.hora_fin = task.hora_fin;
    taskFound.tiempo_total = task.tiempo_total;
    taskFound.factor_tiempo_total = task.factor_tiempo_total;
    taskFound.total_tarifa = task.total_tarifa;
    taskFound.descripcion = task.descripcion;
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
async function sendEmailCreate(tarea, usuario, tarea2){
  try {
    const proyecto = await Proyecto.findByPk(tarea.id_proyecto)
    const servicio = await Servicio.findByPk(tarea.id_servicio)
    const asunto = `El técnico: ${usuario.nombre} ${usuario.apellido} ha agregado una nueva tarea`
    let htmlContent
    if ((tarea2 == null) || (tarea2 == undefined)) {
      // formatear minutos
      const tiempo = formatearMinutos(tarea.tiempo_total)
        htmlContent = `
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
                <h2>¡Se ha registrado una nueva tarea!</h2>
                <p>El técnico <span class="span1">${usuario.nombre} ${usuario.apellido}</span> ha registrado una tarea en el proyecto <span class="span1">${proyecto.nombre}</span></p>
                <p style="text-align: center; font-weight: bold;">
                    Datos de la tarea ${tarea.fecha}
                    </p> 
                    <li>
                        <ul>
                          Hora de inicio: <span>${tarea.hora_inicio}</span>
                        </ul>
                        <ul>
                          Hora de fin: <span>${tarea.hora_fin}</span>
                        </ul>
                        <ul>
                          Tiempo total: <span>${tiempo}</span>h
                        </ul>
                        <ul>
                          Id de servicio: <span>${servicio.id_servicio}</span>
                        </ul>
                        <ul>
                          Servicio: <span>${servicio.nombre_servicio}</span>
                        </ul>
                    </li>
                <footer class="piePagina">
                    <p>Este mensaje fue enviado automáticamente por el sistema. Por favor, no responda a este correo.</p>
            </div>
        </body>
        </html>  
        `
    }else{
      // formatear minutos
      const tiempo = formatearMinutos(tarea.tiempo_total)
      const tiempo2 = formatearMinutos(tarea2.tiempo_total)
      htmlContent = `
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
              <h2>¡Se ha registrado una nueva tarea!</h2>
              <p>El técnico <span class="span1">${usuario.nombre} ${usuario.apellido}</span> ha registrado una tarea en el proyecto <span class="span1">${proyecto.nombre}</span></p>
              <p style="text-align: center; font-weight: bold;">
                  Datos de la tarea ${tarea.fecha}
                  </p> 
                  <li>
                      <ul>
                        Hora de inicio: <span>${tarea.hora_inicio}</span>
                      </ul>
                      <ul>
                        Hora de fin: <span>${tarea.hora_fin}</span>
                      </ul>
                      <ul>
                        Tiempo total: <span>${tiempo}</span>h
                      </ul>
                      <ul>
                        Id de servicio: <span>${servicio.id_servicio}</span>
                      </ul>
                      <ul>
                        Servicio: <span>${servicio.nombre_servicio}</span>
                      </ul>
                  </li>
              <p style="text-align: center; font-weight: bold;">
                  Datos de la tarea ${tarea2.fecha}
                  </p> 
                  <li>
                      <ul>
                        Hora de inicio: <span>${tarea2.hora_inicio}</span>
                      </ul>
                      <ul>
                        Hora de fin: <span>${tarea2.hora_fin}</span>
                      </ul>
                      <ul>
                        Tiempo total: <span>${tiempo2}</span>h
                      </ul>
                      <ul>
                        Id de servicio: <span>${servicio.id_servicio}</span>
                      </ul>
                      <ul>
                        Servicio: <span>${servicio.nombre_servicio}</span>
                      </ul>
                  </li>
              <footer class="piePagina">
                  <p>Este mensaje fue enviado automáticamente por el sistema. Por favor, no responda a este correo.</p>
          </div>
      </body>
      </html>  
      `
    }
    // obtener los usuarios con rol lider tecnico
    const liderDeProyecto = await user.getLider()
    // enviar correo a los lideres
    for (const lider of liderDeProyecto) {
      await sendEmail(htmlContent, lider.email, asunto);
      console.log('Correo de creación de tarea enviado a: ' + lider.nombre + " " +lider.apellido)
    }
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
  static updatePlusProjectById(id, factor_tiempo_total) {
    return updatePlusProjectById(id,factor_tiempo_total);}

  static sendEmailCreate(tarea, usuario, tarea2) {
    return sendEmailCreate(tarea, usuario, tarea2);
  }
}
