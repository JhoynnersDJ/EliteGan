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
    const result = project.pool_horas - horas;
    const resultHour = project.horas_trabajadas + horas;
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

    const plus = project.pool_horas + task.tiempo_total;
    const minus = project.pool_horas_trabajadas - task.tiempo_total;
    project.pool_horas = plus;
    project.pool_horas_trabajadas = minus;
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
}
