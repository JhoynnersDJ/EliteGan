

import { Proyectos } from '../../../database/hormiwatch/asociaciones.js'
import {Servicios} from '../../../database/hormiwatch/asociaciones.js'
import {Tareas} from '../../../database/hormiwatch/asociaciones.js';
import "dotenv/config";

const dbSelect = process.env.SELECT_DB;
async function save(tarea) {
  if (dbSelect == "MYSQL"){
    const isCompleted = tarea.status === true ? 'C' : 'P';
    return await Tareas.create(
      { fecha: new Date(tarea.fecha), hora_inicio:tarea.hora_inicio, hora_fin: tarea.hora_fin, tiempo_total: tarea.tiempo_total, factor_tiempo_total: tarea.factor_tiempo_total, id_proyecto: tarea.id_proyecto, id_servicio: tarea.id_servicio, total_tarifa: tarea.total_tarifa, status: tarea.status},
      { fields: ['fecha', 'hora_inicio', 'hora_fin', 'tiempo_total', 'factor_tiempo_total', 'id_proyecto', 'id_servicio','total_tarifa', 'status'] }
  )
  }
  return null;
}

async function findProjectById(id) {
  if (dbSelect == "MYSQL") {
    const project = await Proyectos.findByPk(id)
    if (!project) return null;
    return project;
  }
  return null;
}

async function findServiceById(id) {
  if (dbSelect == "MYSQL") {
    const serviceFound = await Servicios.findByPk(id)
    if (!serviceFound) return null;
    return serviceFound;
  }
  return null;
}

async function calulateTotalTime(dt1, dt2){
  var diff =(dt2.getTime() - dt1.getTime()) / 1000;
  diff /= (60 * 60);
  return Math.abs(Math.round(diff));
}

export default class tareaFunction {
  static save(tarea) {
    return save(tarea);
  }
  static findProjectById(id) {
    return findProjectById(id);
  }
  static findServiceById(id) {
    return findServiceById(id);
  }
  static calulateTotalTime(dt1, dt2) {
    return calulateTotalTime(dt1, dt2);
  }
}