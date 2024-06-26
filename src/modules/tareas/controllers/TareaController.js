//import Tareas from '../model/TareasModel.js';
//import {Tareas} from '../../../database/hormiwatch/Tareas.js'
import tarea from "../model/TareaModel.js";
import {
  calcularDiferenciaDeTiempo,
  calculartarifa,
  formatHour,
  esDiaAnterior,
  esDiaDespuesFechaFinal,
  esDiaAntesFechaInicial,
  comprobarHorario,
} from "../libs/Tarifa.js";
import holidayFunction from "../../feriados/model/HolidaysFunction.js";
import { ConnectionRefusedError } from "sequelize";
import {AuditoriaController} from "../../auditoria/controllers/AuditoriaController.js";

const holidays = await holidayFunction.getHolidaysDate();

export const register = async (req, res) => {
  const {
    fecha,
    hora_inicio,
    hora_fin,
    id_proyecto,
    id_servicio,
    status,
    id_usuario    
  } = req.body;

  var { descripcion} = req.body;
  var datos = null;
  try {
    const userFound = await tarea.getUserById(id_usuario);
    if (!descripcion) descripcion = "";

    if (descripcion.length > 50)
      return res.status(404).json({ message: "Descripcion es mayor a 30 caracteres" });

    if (!userFound)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const proyectFound = await tarea.findProjectById(id_proyecto);

    if (!proyectFound)
      return res.status(404).json({ message: "Proyecto no encontrado" });

    if (proyectFound.status)
      return res.status(406).json({ message: "Proyecto ya esta completado" });

    if (
      !esDiaAnterior(fecha, proyectFound.fecha_inicio, proyectFound.fecha_fin)
    ) {
      return res
        .status(403)
        .json({ message: "No se pueden crear tareas con fechas futuras" });
    }

    if (
      !esDiaDespuesFechaFinal(
        fecha,
        proyectFound.fecha_inicio,
        proyectFound.fecha_fin
      )
    ) {
      return res.status(403).json({
        message: "Fecha ingresada es superior a la fecha final del proyecto",
      });
    }

    if (
      !esDiaAntesFechaInicial(
        fecha,
        proyectFound.fecha_inicio,
        proyectFound.fecha_fin
      )
    ) {
      return res.status(403).json({
        message: "Fecha ingresada es inferior a la fecha inicial del proyecto",
      });
    }

    const serviceFound = await tarea.findServiceById(id_servicio);

    if (!serviceFound)
      return res.status(404).json({ message: "Servicio no encontrado" });

    var time = calcularDiferenciaDeTiempo(hora_inicio, hora_fin);

    var time2 = calculartarifa(hora_inicio, hora_fin, fecha, holidays);

    if (time2.fin && hora_fin !== "00:00") {
      const horas1 = formatHour(hora_inicio, hora_fin);

      const horas2 = formatHour(hora_inicio, hora_fin);

      const tiempo_total_dia1 = calcularDiferenciaDeTiempo(
        hora_inicio,
        "00:00AM"
      ).tiempo_minutos;
      const tasks1 = await tarea.findTaskByProjectId(id_proyecto);

      if (tasks1.length !== 0) {
        if (
          !comprobarHorario(
            tasks1,
            fecha,
            horas1.tiempo_formateado1,
            id_usuario
          ) ||
          !comprobarHorario(tasks1, fecha, "00:00AM", id_usuario)
        ) {
          return res.status(406).json({
            message: "No se puede agrear tareas en tiempo ya ocupado",
          });
        }
      }

      if (tasks1.length !== 0) {
        if (
          !comprobarHorario(tasks1, time2.fin, "00:00AM", id_usuario) ||
          !comprobarHorario(
            tasks1,
            time2.fin,
            horas2.tiempo_formateado2,
            id_usuario
          )
        ) {
          return res.status(406).json({
            message: "No se puede agrear tareas en tiempo ya ocupado",
          });
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
        id_usuario,
        descripcion
      );
      let factor_horas1 = parseFloat(time2.tarifa1) * 60;
      await tarea.restPoolProjectById(
        id_proyecto,
        parseInt(factor_horas1.toFixed(2))
      );

      datos = await tarea.save(tareaSaved_dia1);

      await AuditoriaController.resgistrarAccion("creado", "tarea", datos)(req, res);

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
        id_usuario,
        descripcion
      );
      datos = await tarea.save(tareaSaved_dia2);

      

      let factor_horas2 = parseFloat(time2.tarifa2) * 60;

      await tarea.restPoolProjectById(
        id_proyecto,
        parseInt(factor_horas2.toFixed(2))
      );
      await AuditoriaController.resgistrarAccion("creado", "tarea", datos)(req, res);
      // enviar notificacion al correo
      await tarea.sendEmailCreate(tareaSaved_dia1, userFound,tareaSaved_dia2)
    } else {
      const horas = formatHour(hora_inicio, hora_fin);

      const tasks = await tarea.findTaskByProjectId(id_proyecto);
      if (tasks.length !== 0) {
        if (
          !comprobarHorario(
            tasks,
            fecha,
            horas.tiempo_formateado1,
            id_usuario
          ) ||
          !comprobarHorario(tasks, fecha, horas.tiempo_formateado2, id_usuario)
        ) {
          return res.status(406).json({
            message: "No se puede agrear tareas en tiempo ya ocupado",
          });
        }
      }

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
        id_usuario,
        descripcion
      );
      datos = await tarea.save(tareaSaved);
      
      let factor_horas3 = parseFloat(time2.tarifa1) * 60;
      await tarea.restPoolProjectById(
        id_proyecto,
        parseInt(factor_horas3.toFixed(2))
      );
      await AuditoriaController.resgistrarAccion("creado", "tarea", datos)(req, res);
      // enviar notificacion al correo
      await tarea.sendEmailCreate(tareaSaved, userFound)
    }

    datos = null;
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
    return res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getByProjectAndUser = async (req, res) => {
  const { id, id_usuario } = req.params;
  //const { id_usuario } = req.body;
  try {
    const proyectFound = await tarea.findProjectById(id);

    if (!proyectFound)
      return res.status(404).json({ message: "Proyecto no encontrado" });

    const userFound = await tarea.getUserById(id_usuario);

    if (!userFound)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const tasks = await tarea.findTaskByProjectAndUserId(id, id_usuario);
    return res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteById = async (req, res) => {
  const { id } = req.params;
  try {
    const taskFound = await tarea.getTasksById(id);
    const datos = taskFound;
    await AuditoriaController.resgistrarAccion("eliminado", "tarea", datos)(req, res);
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

    if (!taskFound)
      return res.status(404).json({ message: "tarea no encontrada" });

    if (id_servicio) {
      const serviceFound = await tarea.findServiceById(id_servicio);

      if (!serviceFound)
        return res.status(404).json({ message: "Servicio no encontrado" });
    } else {
      id_servicio = taskFound.id_servicio;
    }
    if (status && typeof status === "boolean") {
      status = "C";
    } else {
      status = "P";
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
      null,
      id_servicio,
      null,
      status,
      null,
      null
    );

    const updateTask = await tarea.updateTaskById(tareaSaved);

    if (!updateTask)
      return res.status(200).json({ message: "Tarea no pudo ser editada" });

    res.status(200).json({ message: "Tarea editada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

  
};

export const updateTaskMaster = async (req, res) => {
  var { id_servicio, status, hora_inicio, hora_fin, id_usuario, descripcion } = req.body;
  const { id } = req.params;
  try {
    var formattedDatos = {
      id_servicio: id_servicio,
      status: status,
      hora_inicio: hora_inicio,
      hora_fin: hora_fin,
      descripcion: descripcion      
    }
    const taskFound = await tarea.getTasksById(id);
    if ((typeof descripcion === "undefined") || (descripcion === null)) {
      descripcion = taskFound.descripcion;
    }

    if (descripcion.length > 50)
        return res.status(404).json({ message: "Descripcion es mayor a 30 caracteres" });
    if (!taskFound)
      return res.status(404).json({ message: "tarea no encontrada" });

    const datos = taskFound;

    const fecha = taskFound.fecha;

    const id_proyecto = taskFound.id_proyecto;

    if (id_servicio) {
      const serviceFound = await tarea.findServiceById(id_servicio);

      if (!serviceFound)
        return res.status(404).json({ message: "Servicio no encontrado" });
    } 
    if (status && typeof status === "boolean") {
      status = "C";
    } else {
      status = "P";
    }

    if (typeof status === "undefined") {
      status = taskFound.status;
    }
    
    if (!hora_inicio || typeof hora_inicio === "undefined") {
      hora_inicio = taskFound.hora_inicio;
    }

    if (!hora_fin || typeof hora_fin === "undefined") {
      hora_fin = taskFound.hora_fin;
    }

    var time = calcularDiferenciaDeTiempo(hora_inicio, hora_fin);

    var time2 = calculartarifa(hora_inicio, hora_fin, fecha, holidays);

    if (time2.fin && hora_fin !== "00:00") {
      return res.status(400).json({
        message: "Tarea no pudo ser editada, la hora final no es valida",
      });
    } else {
      await tarea.updatePlusProjectById(id, taskFound.factor_tiempo_total);

      const horas = formatHour(hora_inicio, hora_fin);
      
      
      const proyectFound = await tarea.findProjectById(id_proyecto);

      if (!proyectFound)
        return res.status(404).json({ message: "Proyecto no encontrado" });
      const tareaSaved = new tarea(
        id,
        fecha,
        horas.tiempo_formateado1,
        horas.tiempo_formateado2,
        time.tiempo_minutos,
        time2.tarifa1,
        null,
        id_servicio,
        time2.tarifa1 * proyectFound.tarifa,
        status,
        null,
        id_usuario, 
        descripcion
      );
      
      
      
      let factor_horas3 = parseFloat(time2.tarifa1) * 60;
      await tarea.restPoolProjectById(
        id_proyecto,
        parseInt(factor_horas3.toFixed(2))
      );
      const updateTask = await tarea.updateTaskById(tareaSaved);
      await AuditoriaController.resgistrarAccion("modificado", "tarea", datos)(req, res);
      if (!updateTask)
        return res.status(400).json({ message: "Tarea no pudo ser editada" });

      res.status(200).json({ message: "Tarea editada exitosamente" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
