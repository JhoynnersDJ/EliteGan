import tareaFunction from "./TareaFunction.js";

export default class tarea {
  constructor(
    id_tarea,
    fecha,
    hora_inicio,
    hora_fin,
    tiempo_total,
    factor_tiempo_total,
    id_proyecto,
    id_servicio,
    total_tarifa,
    status,
    nombre_servicio,
    id_usuario
  ) {
    this.id_tarea = id_tarea;
    this.fecha = fecha;
    this.hora_inicio = hora_inicio;
    this.hora_fin = hora_fin;
    this.tiempo_total = tiempo_total;
    this.factor_tiempo_total = factor_tiempo_total;
    this.id_proyecto = id_proyecto;
    this.id_servicio = id_servicio;
    this.total_tarifa = total_tarifa;
    this.status = status;
    this.nombre_servicio = nombre_servicio;
    this.id_usuario = id_usuario;
  }
  static save(tarea) {
    return tareaFunction.save(tarea);
  }
  static findProjectById(id) {
    return tareaFunction.findProjectById(id);
  }
  static restPoolProjectById(id, horas) {
    return tareaFunction.restPoolProjectById(id, horas);
  }
  static findServiceById(id) {
    return tareaFunction.findServiceById(id);
  }
  static calulateTotalTime(dt1, dt2) {
    return tareaFunction.calulateTotalTime(dt1, dt2);
  }
  static findTaskByProjectId(id) {
    return tareaFunction.findTaskByProjectId(id);
  }
  static deleteTasksById(id) {
    return tareaFunction.deleteTasksById(id);
  }
  static getTasksById(id) {
    return tareaFunction.getTasksById(id);
  }
  static updateTaskById(task) {
    return tareaFunction.updateTaskById(task);
  }
  static getUserById(id) {
    return tareaFunction.getUserById(id);
  }
  static completeTaskByProjectId(id) {
    return tareaFunction.completeTaskByProjectId(id);
  }
  static completeTasksById(id) {
    return tareaFunction.completeTasksById(id);
  }
  static findTaskByProjectAndUserId(id, id_user) {
    return tareaFunction.findTaskByProjectAndUserId(id, id_user);
  }
  static findUserByProjectId(id) {
    return tareaFunction.findUserByProjectId(id);
  }
}
