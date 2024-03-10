import holiday from "../model/HolidaysModel.js"
import got from 'got';
import  {v4 } from "uuid";
const TOKEN_API = process.env.TOKEN_API;

//cargar los feriados desde la api de google calendar
export const loadHolidays = async (req,res) => {
    try {
        //se consume el endpoint para obtener todos los feriados de google calendar y se obtiene un json
        const items = await got
            .get(`https://www.googleapis.com/calendar/v3/calendars/es.ve%23holiday%40group.v.calendar.google.com/events?key=${TOKEN_API}`)
            .json(); 
            
        //se convierte en objeto solo los items del json
        const obj = JSON.parse(JSON.stringify(items.items));

        //los objetos son convertidos a holidays y guardados en el holidaysMock
        obj.forEach(async (element) => {
            const datef = new Date(element.start.date);
            //busca un feriado por id
            const holidayFound = await holiday.findOneByDate(datef.toISOString().split('T')[0]);
            //console.log(holidayFound)
            //si consigue el feriado lanza un mensaje de feriado no encontrado
            if (holidayFound) return//{console.log(holidayFound); return };
            //console.log(holidayFound)
            //se ccrea un nuevo holiday
            const holidayItem = new holiday(element.summary, datef.toISOString().split('T')[0]);

            //se guarda el nuevo objeto en el holidaymock
            await holiday.save(holidayItem);
            
        });
        
        res.status(200).json(obj)
    } catch (err) {
        return res.status(404).json({message: err.message});
    }
}

//te devuelve todos los feriados que han sido guardados
export const getHolidays = async (req,res) => {
    try {

        //busca los feriados
        const all = await holiday.getHolidays();

        if (!all) return res.status(500).json({message: 'No hay feriados'});
        
        //devuelve un json de los feriados como response
        res.status(200).json(all);
        //all = null;
    } catch (error) {
        return res.status(500).json({message: 'Something goes wrong'});
    }
}

//se crea un nuevo dia feriado
export const createHoliday = async (req, res) => {    
    try {      
        
        const { nombre, fecha} = req.body;  
        console.log(fecha)
        //busca un feriado por id
        const holidayFound = await holiday.findOneByDate(new Date(fecha));

        //si consigue el feriado lanza un mensaje de feriado con fecha repetida
        if (holidayFound) return res.status(500).json({message: "Holiday Found, repeated date"});
        console.log(holidayFound)
        //se ccrea un nuevo holiday
        const holidayItem = new holiday(nombre, new Date(fecha));

        //se guarda el nuevo objeto en el holidaymock
        const newhol = await holiday.save(holidayItem);

        //se devuelve como respuesta el feriado creado
        res.status(200).json(newhol);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

//obtiene un feriado por id y lo actualiza
export const updateHoliday = async (req, res) => {
    try {
        const { nombre, fecha } = req.body;

        //busca un feriado por id
        const holidayFound = await holiday.findOne(req.params.id);

        //si no consigue el feriado lanza un mensaje de feriado no encontrado
        if (!holidayFound) return res.status(202).json({message: "Holiday not Found"});

        //si se introdujo un nombre se actualiza
        if (nombre) holidayFound.setHolidayName(nombre,req.params.id);

        //si se introdujo un nombre se actualiza
        if (fecha) holidayFound.setHolidayDate(fecha,req.params.id);

        //se devuelve como respuesta el feriado actualizado
        res.status(200).json(holidayFound);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }

}

//te devuelve un solo feriado por id
export const getHoliday = async (req, res) => {
    try {        

        //busca un feriado por id
        const holidayFound = await holiday.findOne(req.params.id);

        //si no consigue el feriado lanza un mensaje de feriado no encontrado
        if (!holidayFound) return res.status(202).json({message: "Holiday not Found"});   
        
        //se devuelve como respuesta el feriado encontrado
        res.status(200).json(holidayFound);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }

}

export const getHolidayByDate = async (req, res) => {
    try {
        const {fecha} = req.body;
        /*//busca un feriado por id
        const holidayFound = await holiday.findOneByDate(new Date(req.params.date));

        //si no consigue el feriado lanza un mensaje de feriado no encontrado
        if (!holidayFound) return res.status(500).json({message: "Holiday not Found"});   
        res.status(200).json(holidayFound);*/
        //busca un feriado por id
        const holidayFound2 = await holiday.findOneByDate(new Date(fecha));

        //si no consigue el feriado lanza un mensaje de feriado no encontrado
        if (!holidayFound2) return res.status(202).json({message: "Holiday not Found"});
        
        //se devuelve como respuesta el feriado encontrado
        res.status(200).json(holidayFound2);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }

}

//elimina un solo feriado por id
export const deleteHoliday = async (req, res) => {
    try {
        const { name, date } = req.body;
        console.log(req.params.id)
        //busca un feriado por id
        const holidayFound = await holiday.findOne(req.params.id);
        
        //si no consigue el feriado lanza un mensaje de feriado no encontrado
        if (!holidayFound) return res.status(202).json({message: "Holiday not Found"});

        //se elimina el dia feriado por id
        holiday.deleteOne(req.params.id);

        //se devuelve como respuesta el feriado eliminado
        res.json(holidayFound);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }

}

