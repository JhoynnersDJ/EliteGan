import tareaFunction from './TareaFunction.js';

export default class tarea{
    constructor(id_tarea, fecha, hora_inicio,hora_fin,  tiempo_total, factor_tiempo_total,id_proyecto,id_servicio, total_tarifa, status){
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
        
    }
    static save(tarea) {
        return tareaFunction.saveTarea(tarea);
      }
      static findProjectById(id) {
        return tareaFunction.findProjectById(id);
      }
      static findServiceById(id) {
        return tareaFunction.findServiceById(id);
      }
      static calulateTotalTime(dt1, dt2) {
        return tareaFunction.calulateTotalTime(dt1, dt2);
      }
}