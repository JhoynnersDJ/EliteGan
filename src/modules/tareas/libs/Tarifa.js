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
    return `${horas}:${minutos < 10 ? '0' : ''}${minutos}`;
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
    //console.log(horasInicio)
    //console.log(horasFin)
    const fechaInicio = new Date(inicio); 
    var fechaFin = null;   
    // Si date2 es antes que date1 y hay un salto de día, ajusta la fecha de fin
    if (horasFin < horasInicio || (horasFin === horasInicio && parseInt(minutes2) <= parseInt(minutes1))) {
        //console.log(horasFin)
        horasFin += 24;
        
        fechaFin = new Date(inicio);
        fechaFin.setDate(fechaFin.getDate() + 1); // Establecer el día siguiente a la fecha de inicio

        const dia = fechaFin.getDate()+1;
        const mes = fechaFin.getMonth() + 1; // Los meses en JavaScript se indexan desde 0
        const año = fechaFin.getFullYear();

        fin = `${año}-${mes < 10 ? '0' : ''}${mes}-${dia < 10 ? '0' : ''}${dia}`;
        //console.log(fechaFin.getDay())
    }
    if ((horasFin === horasInicio && parseInt(minutes2) > parseInt(minutes1))){ horasFin+=1;}
    let tarifa = 0;
    var time = horasInicio;
    var date1 = fechaInicio;
    var tarifa1;
    var tarifa2;
    // Itera sobre cada hora y cuenta las horas transcurridas
    for (let i = horasInicio; i < horasFin; i++) {
        // Si la hora está fuera del rango 7:00AM a 7:00PM, suma 1.5
        if(time === 24) {
            time = 0;
            tarifa1=tarifa;
            date1 = fechaFin;
        };

        if ( (date1.getDay() === 6 ) || isHoliday(date1)) {
            tarifa += 2;
            time += 1;
            //console.log(date1)
            continue;
        }        

        if ((time < 7 || time >= 19) || (date1.getDay() === 5 )) {
            tarifa += 1.5;
            time += 1;
            //console.log('por 1.5')
            continue;
        } else {
            time += 1;
            tarifa += 1;
            //console.log('por 1')
        }
        
    }
    tarifa2=tarifa-tarifa1;
    if(!tarifa1) tarifa1 = tarifa;
    return { tarifa1, tarifa2, fin };
}

export async function isHoliday(fecha) {
    const holidays = await holidayFunction.getHolidaysDate();
    return holidays.includes(fecha);
}