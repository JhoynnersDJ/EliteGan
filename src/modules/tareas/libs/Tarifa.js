import holidayFunction from '../../feriados/model/HolidaysFunction.js'

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
    if (horasInicio > horasFin || (horasInicio === horasFin && parseInt(minutes1) > parseInt(minutes2))) {
        horasFin += 24;
    }

    // Si las horas son iguales y representan el final del día, establece la diferencia a 24 horas
    if (horasInicio === horasFin && parseInt(minutes1) === parseInt(minutes2)) {
        return '24:00';
    }

    // Calcula la diferencia en minutos
    let diferenciaEnMinutos = (horasFin * 60 + parseInt(minutes2)) - (horasInicio * 60 + parseInt(minutes1));

    // Calcula las horas y minutos de la diferencia
    const horas = Math.floor(diferenciaEnMinutos / 60);
    const minutos = diferenciaEnMinutos % 60;

    // Retorna la diferencia en formato de horas y minutos
    const tiempo_formateado = `${horas}:${minutos < 10 ? '0' : ''}${minutos}`;
    const tiempo_minutos = (horas * 60) + minutos;
    return { tiempo_formateado, tiempo_minutos }
}

export function calculartarifa(date1, date2, inicio) {

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
    if (horasFin < horasInicio || (horasFin === horasInicio && parseInt(minutes2) <= parseInt(minutes1))) {
        //console.log(horasFin)
        horasFin += 24;

        fechaFin = new Date(inicio);
        fechaFin.setDate(fechaFin.getDate() + 1); // Establecer el día siguiente a la fecha de inicio

        const dia = fechaFin.getDate() + 1;
        const mes = fechaFin.getMonth() + 1; // Los meses en JavaScript se indexan desde 0
        const año = fechaFin.getFullYear();

        fin = `${año}-${mes < 10 ? '0' : ''}${mes}-${dia < 10 ? '0' : ''}${dia}`;
    }

    let tarifa = 0;

    var time = ((horasInicio * 60) + Number(minutes1));

    var date1 = fechaInicio;

    var tarifa1;

    var tarifa2 = null;
    // Itera sobre cada hora y cuenta las horas transcurridas
    for (let i = ((horasInicio * 60) + Number(minutes1)); i < ((horasFin * 60) + Number(minutes2)); i++) {
        
        if (time === (24 * 60)) {
            time = 0;
            tarifa1 = tarifa;
            date1 = fechaFin;
        };
        //si es domingo o feriado suma 2
        if ((date1.getDay() === 6) || isHoliday(date1)) {
            tarifa += (2 / 60);
            time += 1;
            continue;
        }
        // Si la hora está fuera del rango 7:00AM a 7:00PM, o es sabado, suma 1.5
        //de lo contrario suma 1
        if ((time < (7 * 60) || time >= (19 * 60)) || (date1.getDay() === 5)) {
            tarifa += (1.5 / 60);
            time += 1;
            continue;
        } else {
            tarifa += (1 / 60);
            time += 1;

        }

    }

    if (!tarifa1) tarifa1 = Number(tarifa.toFixed(1));

    if (tarifa !== tarifa1) tarifa2 = (Number(tarifa.toFixed(1))) - (Number(tarifa1.toFixed(1)));

    tarifa1 = Number(tarifa1.toFixed(1));

    return { tarifa1, tarifa2, fin };
}

export function isHoliday(fecha) {
    /*const holidays = await holidayFunction.getHolidaysDate();
    return holidays.includes(fecha);*/
    return false;
}