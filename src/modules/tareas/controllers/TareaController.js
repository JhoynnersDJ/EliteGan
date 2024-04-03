//import Tareas from '../model/TareasModel.js';
//import {Tareas} from '../../../database/hormiwatch/Tareas.js'
import tarea from "../model/TareaModel.js";
import {
  calcularDiferenciaDeTiempo,
  calculartarifa,
  formatHour,
  esDiaActualOAnterior,
  esDiaAnterior,
  esDiaDespuesFechaFinal,
  esDiaAntesFechaInicial,
  comprobarHorario
} from "../libs/Tarifa.js";
import holidayFunction from "../../feriados/model/HolidaysFunction.js";
const holidays = await holidayFunction.getHolidaysDate();

export const register = async (req, res) => {
  const {
    fecha,
    hora_inicio,
    hora_fin,
    id_proyecto,
    id_servicio,
    status,
    id_usuario,
  } = req.body;

  try {
    const userFound = await tarea.getUserById(id_usuario);

    if (!userFound)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const proyectFound = await tarea.findProjectById(id_proyecto);

    if (!proyectFound)
      return res.status(404).json({ message: "Proyecto no encontrado" });
    if (
      !esDiaAnterior(
        fecha,
        proyectFound.fecha_inicio,
        proyectFound.fecha_fin,        
      )
    ) {
      return res.status(403).json({ message: "No se pueden crear tareas con fechas futuras" });
    }

    if (
      !esDiaDespuesFechaFinal(
        fecha,
        proyectFound.fecha_inicio,
        proyectFound.fecha_fin,        
      )
    ) {
      return res.status(403).json({ message: "Fecha ingresada es superior a la fecha final del proyecto" });
    }

    if (
      !esDiaAntesFechaInicial(
        fecha,
        proyectFound.fecha_inicio,
        proyectFound.fecha_fin,        
      )
    ) {
      return res.status(403).json({ message: "Fecha ingresada es inferior a la fecha inicial del proyecto" });
    }
    
    //console.log(tasks)
    

    const serviceFound = await tarea.findServiceById(id_servicio);

    if (!serviceFound)
      return res.status(404).json({ message: "Servicio no encontrado" });

    var time = calcularDiferenciaDeTiempo(hora_inicio, hora_fin);

    var time2 = calculartarifa(hora_inicio, hora_fin, fecha, holidays);

    if (time2.fin) {
      const horas1 = formatHour(hora_inicio, hora_fin);

      const horas2 = formatHour(hora_inicio, hora_fin);

      const tiempo_total_dia1 = calcularDiferenciaDeTiempo(
        hora_inicio,
        "00:00AM"
      ).tiempo_minutos;
      const tasks = await tarea.findTaskByProjectId(id_proyecto);
      console.log(horas1.tiempo_formateado1)
      console.log(horas2.tiempo_formateado2)

      console.log(comprobarHorario(tasks,fecha,horas1.tiempo_formateado1))
      console.log(comprobarHorario(tasks,fecha,"00:00AM"))
      console.log(comprobarHorario(tasks,time2.fin,"00:00AM"))
      console.log(comprobarHorario(tasks,time2.fin,horas2.tiempo_formateado2))
      
      if (tasks.length !== 0){
        if (!comprobarHorario(tasks,fecha,horas1.tiempo_formateado1) || !comprobarHorario(tasks,fecha,"00:00AM")){
          return res.status(406).json({ message: "Hora invalida" });
        }
      }

      if (tasks.length !== 0){
        if (!comprobarHorario(tasks,time2.fin,"00:00AM") || !comprobarHorario(tasks,time2.fin,horas2.tiempo_formateado2)){
          return res.status(406).json({ message: "Hora invalida" });
        }
      }
      const tareaSaved_dia1 = new tarea(
        null,
        fecha,
        horas1.tiempo_formateado1,
        "00:00AM",
        tiempo_total_dia1,
        time2.tarifa1,
        id_proyecto,
        id_servicio,
        time2.tarifa1 * proyectFound.tarifa,
        status,
        null,
        id_usuario
      );

      await tarea.restPoolProjectById(id_proyecto, tiempo_total_dia1);

      await tarea.save(tareaSaved_dia1);

      

      const tiempo_total_dia2 = calcularDiferenciaDeTiempo(
        "00:00AM",
        hora_fin
      ).tiempo_minutos;

      const tareaSaved_dia2 = new tarea(
        null,
        time2.fin,
        "00:00AM",
        horas2.tiempo_formateado2,
        tiempo_total_dia2,
        time2.tarifa2,
        id_proyecto,
        id_servicio,
        time2.tarifa2 * proyectFound.tarifa,
        status,
        null,
        id_usuario
      );

      await tarea.save(tareaSaved_dia2);

      await tarea.restPoolProjectById(id_proyecto, tiempo_total_dia2);
    } else {
      const horas = formatHour(hora_inicio, hora_fin);
      const tasks = await tarea.findTaskByProjectId(id_proyecto);
      console.log(comprobarHorario(tasks,fecha,horas.tiempo_formateado1))
      console.log(comprobarHorario(tasks,fecha,horas.tiempo_formateado2))
      if (tasks.length !== 0){
        if (!comprobarHorario(tasks,fecha,horas.tiempo_formateado1) || !comprobarHorario(tasks,fecha,horas.tiempo_formateado2)){
          return res.status(406).json({ message: "Hora invalida" });
        }
      }
      console.log(hora_inicio)
      console.log(horas.tiempo_formateado2)
      const tareaSaved = new tarea(
        null,
        fecha,
        horas.tiempo_formateado1,
        horas.tiempo_formateado2,
        time.tiempo_minutos,
        time2.tarifa1,
        id_proyecto,
        id_servicio,
        time2.tarifa1 * proyectFound.tarifa,
        status,
        null,
        id_usuario
      );

      await tarea.save(tareaSaved);

      await tarea.restPoolProjectById(id_proyecto, time.tiempo_minutos);
    }
    res
      .status(200)
      .json({ id_usuario: userFound.id_usuario, nombre: userFound.nombre });
    /*res.status(200).json({
            total_time: time.tiempo_formateado,
            total_time2: time.tiempo_minutos,
            total_tarifa_dia1: time2.tarifa1,
            total_tarifa_da2: time2.tarifa2,
            siguiente_dia: time2.fin
        })*/
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getByProject = async (req, res) => {
  const { id } = req.params;
  try {
    const proyectFound = await tarea.findProjectById(id);

    if (!proyectFound)
      return res.status(404).json({ message: "Proyecto no encontrado" });

    const tasks = await tarea.findTaskByProjectId(id);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteById = async (req, res) => {
  const { id } = req.params;
  try {
    const taskFound = await tarea.getTasksById(id);

    if (!taskFound)
      return res.status(404).json({ message: "tarea no encontrada" });

    const deleteTask = await tarea.deleteTasksById(id);
    res.status(200).json(taskFound);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  var { id_servicio, status } = req.body;
  const { id } = req.params;
  try {

    const taskFound = await tarea.getTasksById(id);

    const proyectFound = await tarea.findProjectById(taskFound.id_proyecto);

    if (!proyectFound)
      return res.status(404).json({ message: "Proyecto no encontrado" });

  

    if (id_servicio) {
      const serviceFound = await tarea.findServiceById(id_servicio);

      if (!serviceFound)
        return res.status(404).json({ message: "Servicio no encontrado" });
    } else {
      id_servicio = taskFound.id_servicio;
    }

    if (typeof status === "undefined") {
      status = taskFound.status;
    }


    

    const tareaSaved = new tarea(
      taskFound.id_tarea,
      null,
      null,
      null,
      null,
      null,
      taskFound.id_proyecto,
      id_servicio,
      null,
      status,
      null,
      taskFound.id_usuario
    );

    const updateTask = await tarea.updateTaskById(tareaSaved);

    res.status(200).json(updateTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
