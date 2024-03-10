import holidayFunction from "./HolidaysFunction.js";

//clase que define la estructura de los feriados del sistema
export default class holidays {    
    constructor(nombre, fecha, id) {
        this.nombre = nombre;
        this.fecha = fecha;
        this.id = id;
    }

    //gets de los atributos de user
    getHolidayName() { return this.name; }
    getHolidayDate() { return this.date; }
    getHolidayId() { return this.id; }

    //sets de los atributos de user
    setHolidayName(name,id) { return holidayFunction.updateName(name,id);}
    setHolidayDate(date,id) { return holidayFunction.updateDate(date,id);}    
    setHolidayId(id) { this.id = id;}


    static save(hol){
        return holidayFunction.save(hol);
    }

    static getHolidays(){
        return holidayFunction.getHolidays();
    }

    static findOne(id){
        return holidayFunction.findOne(id);
    }

    static findOneByDate(date){
        return holidayFunction.findOneByDate(date);
    }

    static deleteOne(id){
        holidayFunction.deleteOne(id);
    }

}