import { Proyectos } from "../../../database/hormiwatch/asociaciones.js";
import { Servicios } from "../../../database/hormiwatch/asociaciones.js";
import { Tareas } from "../../../database/hormiwatch/asociaciones.js";
import tarea from "./TareaModel.js";
import { calcularDiferenciaDeTiempo, calculartarifa } from '../libs/Tarifa.js'
import "dotenv/config";

const dbSelect = process.env.SELECT_DB;
async function save(tarea) {
  if (dbSelect == "MYSQL") {
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
        ],
      }
    );
    
  }
  return null;
}

async function findProjectById(id) {
  if (dbSelect == "MYSQL") {
    const project = await Proyectos.findByPk(id);
    if (!project) return null;
    return project;
  }
  return null;
}

async function restPoolProjectById(id, horas) {
  if (dbSelect == "MYSQL") {
    const project = await Proyectos.findByPk(id);
    if (!project) return null;
    const result = project.pool_horas - horas;
    project.pool_horas = result;
    return project.save();
  }
  return null;
}

async function findServiceById(id) {
  if (dbSelect == "MYSQL") {
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
  if (dbSelect == "MYSQL") {
    const tasks = await Tareas.findAll({
      where: {
        id_proyecto: id,
      },
      include: [
        {
          model: Servicios,
          attributes: ["nombre_servicio"],
        },
      ],
    });

    if (tasks.length === 0 || !tasks) return [];
    let newTasks = [];
    tasks.forEach((task) =>
      newTasks.push(
        new tarea(
          task.dataValues.id_tarea,
          task.dataValues.fecha,
          task.dataValues.hora_inicio,
          task.dataValues.hora_fin,
          calcularDiferenciaDeTiempo(task.hora_inicio,task.hora_fin).tiempo_formateado,
          task.dataValues.factor_tiempo_total,
          task.dataValues.id_proyecto,
          task.dataValues.id_servicio,
          task.dataValues.total_tarifa,
          task.dataValues.status,
          task.dataValues.servicio.dataValues.nombre_servicio
        )
      )
    );
    return newTasks;
  }
  return null;
}

async function deleteTasksById(id) {
  if (dbSelect == "MYSQL") {
    const task = await Tareas.findByPk(id);
    if (!task) return null;

    const project = await Proyectos.findByPk(task.dataValues.id_proyecto);
    if (!project) return null;

    const plus = project.pool_horas + task.tiempo_total;
    project.pool_horas = plus;
    project.save();

    return await Tareas.destroy({
      where: { id_tarea: id },
    });
  }
  return null;
}

async function getTasksById(id) {
  if (dbSelect == "MYSQL"){
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
      null
    )
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
}
