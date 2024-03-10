import { Proyecto } from '../../src/Modelo/Syssopgan/ProyectoModel.js'
import {Servicio} from '../../src/Modelo/Syssopgan/ServicioModel.js'
import "dotenv/config";

const dbSelect = process.env.SELECT_DB;
async function save(tarea) {
  return;
}

async function findProjectById(id) {
  if (dbSelect == "MYSQL") {
    const project = await Proyecto.findByPk(id, {
      attributes: [
        'id_proyecto',
        'tarifa',
        'nombre_proyecto',
        'id_responsable_tecnico_fk',
        'id_usuario_fk',
        'id_responsable_cliente_fk',
        'status',
        'fecha_inicio'
      ]
    })
    if (!project) return null;
    return project;
  }
  return null;
}

async function findServiceById(id) {
  if (dbSelect == "MYSQL") {
    const serviceFound = await Servicio.findByPk(id)
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
    return saveTarea(tarea);
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