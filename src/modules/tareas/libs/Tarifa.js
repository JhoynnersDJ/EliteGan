import holidayFunction from "../../feriados/model/HolidaysFunction.js";

export function formatHour(date1, date2) {
  const [hours1, minutes1] = date1.match(/\d+|AM|PM/g);

  // Parsea las horas, minutos y período de date2
  const [hours2, minutes2] = date2.match(/\d+|AM|PM/g);

  // Convierte las horas de 12 horas a 24 horas
  let horasInicio = parseInt(hours1);
  let horasFin = parseInt(hours2);

  let minutoInicio = parseInt(minutes1);
  let minutoFin = parseInt(minutes2);
  let period1;
  let period2;

  if (horasInicio === 12) {
    period1 = "PM";
  } else if (horasInicio === 24) {
    period1 = "AM";
    horasInicio = 0;
  } else if (horasInicio > 12 && horasInicio <= 23) {
    period1 = "PM";
    horasInicio -= 12;
  } else {
    period1 = "AM";
  }

  if (horasFin === 12) {
    period2 = "PM";
  } else if (horasFin === 24) {
    period2 = "AM";
    horasFin = 0;
  } else if (horasFin > 12 && horasFin <= 23) {
    period2 = "PM";
    horasFin -= 12;
  } else {
    period2 = "AM";
  }

  const tiempo_formateado1 = `${horasInicio}:${
    minutoInicio < 10 ? "0" : ""
  }${minutoInicio}${period1}`;
  const tiempo_formateado2 = `${horasFin}:${
    minutoFin < 10 ? "0" : ""
  }${minutoFin}${period2}`;
  return { tiempo_formateado1, tiempo_formateado2 };
}

export function calcularDiferenciaDeTiempo(date1, date2) {
  // Parsea las horas, minutos y período de date1
  const [hours1, minutes1, period1] = date1.match(/\d+|AM|PM/g);

  // Parsea las horas, minutos y período de date2
  const [hours2, minutes2, period2] = date2.match(/\d+|AM|PM/g);

  // Convierte las horas de 12 horas a 24 horas
  let horasInicio = parseInt(hours1);
  let horasFin = parseInt(hours2);

  // Si el período es PM y no son las 12 PM, añade 12 horas
  if (period1 === "PM" && horasInicio !== 12) {
    horasInicio += 12;
  }
  if (period2 === "PM" && horasFin !== 12) {
    horasFin += 12;
  }

  // Si date2 es antes que date1, ajusta las horas de date2
  if (
    horasInicio > horasFin ||
    (horasInicio === horasFin && parseInt(minutes1) > parseInt(minutes2))
  ) {
    horasFin += 24;
  }

  // Si las horas son iguales y representan el final del día, establece la diferencia a 24 horas
  if (horasInicio === horasFin && parseInt(minutes1) === parseInt(minutes2)) {
    return "24:00";
  }

  // Calcula la diferencia en minutos
  let diferenciaEnMinutos =
    horasFin * 60 +
    parseInt(minutes2) -
    (horasInicio * 60 + parseInt(minutes1));

  // Calcula las horas y minutos de la diferencia
  const horas = Math.floor(diferenciaEnMinutos / 60);
  const minutos = diferenciaEnMinutos % 60;

  // Retorna la diferencia en formato de horas y minutos
  const tiempo_formateado = `${horas}:${minutos < 10 ? "0" : ""}${minutos}`;
  const tiempo_minutos = horas * 60 + minutos;
  return { tiempo_formateado, tiempo_minutos };
}

export function calculartarifa(date1, date2, inicio, holidays) {
  let fin; // Inicializamos la variable fin aquí

  // Parsea las horas, minutos y período de date1
  const [hours1, minutes1, period1] = date1.match(/\d+|AM|PM/g);

  // Parsea las horas, minutos y período de date2
  const [hours2, minutes2, period2] = date2.match(/\d+|AM|PM/g);

  // Convierte las horas de 12 horas a 24 horas
  let horasInicio = parseInt(hours1);
  let horasFin = parseInt(hours2);

  // Si el período es PM y no son las 12 PM, añade 12 horas
  if (period1 === "PM" && horasInicio !== 12) {
    horasInicio += 12;
  }
  if (period2 === "PM" && horasFin !== 12) {
    horasFin += 12;
  }

  const fechaInicio = new Date(inicio);

  var fechaFin = null;
  // Si date2 es antes que date1 y hay un salto de día, ajusta la fecha de fin
  if (
    horasFin < horasInicio ||
    (horasFin === horasInicio && parseInt(minutes2) <= parseInt(minutes1))
  ) {
    //console.log(horasFin)
    horasFin += 24;

    fechaFin = new Date(inicio);
    fechaFin.setDate(fechaFin.getDate() + 1); // Establecer el día siguiente a la fecha de inicio

    const dia = fechaFin.getDate() + 1;
    const mes = fechaFin.getMonth() + 1; // Los meses en JavaScript se indexan desde 0
    const año = fechaFin.getFullYear();

    fin = `${año}-${mes < 10 ? "0" : ""}${mes}-${dia < 10 ? "0" : ""}${dia}`;
  }

  let tarifa = 0;

  var time = horasInicio * 60 + Number(minutes1);

  var date1 = fechaInicio;

  var date2 = inicio;

  var tarifa1;

  var tarifa2 = null;
  // Itera sobre cada hora y cuenta las horas transcurridas
  for (
    let i = horasInicio * 60 + Number(minutes1);
    i < horasFin * 60 + Number(minutes2);
    i++
  ) {
    if (time === 24 * 60) {
      time = 0;
      tarifa1 = tarifa;
      date1 = fechaFin;
      date2 = fin;
    }
    //si es domingo o feriado suma 2
    if (date1.getDay() === 6 || holidays.includes(date2)) {
      tarifa += 2 / 60;
      time += 1;
      continue;
    }
    // Si la hora está fuera del rango 7:00AM a 7:00PM, o es sabado, suma 1.5
    //de lo contrario suma 1
    if (time < 7 * 60 || time >= 19 * 60 || date1.getDay() === 5) {
      tarifa += 1.5 / 60;
      time += 1;
      continue;
    } else {
      tarifa += 1 / 60;
      time += 1;
    }
  }

  if (!tarifa1) tarifa1 = Number(tarifa.toFixed(3));

  if (tarifa !== tarifa1)
    tarifa2 = Number(tarifa.toFixed(3)) - Number(tarifa1.toFixed(3));

  tarifa1 = Number(tarifa1.toFixed(3));
  //console.log(tarifa1);
  return { tarifa1, tarifa2, fin };
}

export async function isHoliday(holidays, fecha) {
  return holidays.includes(fecha);
}

export function esDiaActualOAnterior(
  fecha,
  date1,
  date2,
  hora_inicio,
  hora_fin
) {
  // Convertir la fecha dada a un objeto Date
  const fechaDada = new Date(fecha);
  // Obtener la fecha actual
  const fechaInicio = new Date(date1);
  const fechaFin = new Date(date2);
  // Comparar si la fecha dada es igual a la fecha actual o a la fecha anterior
  return (
    Date.parse(fechaDada) <= Date.parse(fechaFin) &&
    Date.parse(fechaDada) >= Date.parse(fechaInicio) &&
    Date.parse(fechaDada) <= Date.parse(new Date())
  );
}

export function comprobarHorario(tasks, fecha_inicial, hora_inicial) {
  
  // Comprobar si la fecha inicial está presente en el array de tareas
  /*const tareaFecha = task.find(tarea => tarea.fecha === fecha_inicial);

  if (!tareaFecha) {
      // Si no se encuentra la fecha en las tareas, devolver false
      return false;
  }*/
  
  var cont = true;
  tasks.forEach((tareaFecha) => {
    console.log(tareaFecha.hora_inicio )
    if (tareaFecha.fecha === fecha_inicial) {
      console.log(convertirAMinutos(hora_inicial) )
      console.log(tareaFecha.hora_fin )
      // Convertir las horas a minutos para facilitar la comparación
      const horaInicioMinutos = convertirAMinutos(tareaFecha.hora_inicio);
      const horaFinMinutos = convertirAMinutos(tareaFecha.hora_fin);
      const horaInicialMinutos = convertirAMinutos(hora_inicial);
      // Comprobar si la hora inicial está entre la hora de inicio y la hora de fin
      if (
        horaInicialMinutos >= horaFinMinutos && horaInicialMinutos <= horaInicioMinutos
      ) {
        // Si la hora inicial está dentro del rango, devolver false
        console.log("aiudaaaaaaaaaaaaaa")
        console.log(horaInicioMinutos)
      console.log(horaFinMinutos)
      console.log(horaInicialMinutos)
        cont=false;
        return false;
        
      } 
    }
  });
  return cont;
}

// Función para convertir las horas en formato AM/PM a minutos
function convertirAMinutos(hora) {

  const [hours1, minutes1, period1] = hora.match(/\d+|AM|PM/g); 

  // Convierte las horas de 12 horas a 24 horas
  let horasInicio = parseInt(hours1);
  let minutesInicio = parseInt(minutes1);

  // Si el período es PM y no son las 12 PM, añade 12 horas
  if (period1 === "PM" && horasInicio !== 12) {
    horasInicio += 12;
    //console.log(horasInicio * 60 + minutesInicio)
  }
  
  const minutesTotal = horasInicio * 60 + minutesInicio

  return minutesTotal;
}
