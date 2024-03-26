import { Servicios } from '../../../database/hormiwatch/asociaciones.js'
import { Op } from "sequelize";

const database = process.env.SELECT_DB;

export class Servicio {
    constructor(id, nombre, plataforma, categoria, tipo, descripcion){
        this.id = id
        this.nombre= nombre
        this.plataforma = plataforma
        this.categoria= categoria
        this.tipo = tipo
        this.descripcion = descripcion
    }

    // devuelve todos los registros
    static async findAll(){
        try {
            // funcion para las bases de datos de sequelize
            if (database === "SEQUELIZE") {
                const servicios = await Servicios.findAll()
                return servicios
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    // devuelve un unico registro segun su primary key
    static async findByPk(id){
        try {
            // funcion para las bases de datos de sequelize
            if (database === "SEQUELIZE") {
                const servicio = await Servicios.findByPk(id)
                return servicio
            }
        } catch (error) {
            console.log(error.message)
        }
    }
    // devuelve un registro donde se encuentre un patron
    static async findPatronId(patron){
        try {
            const id  = patron + '%'
            // funcion para las bases de datos de sequelize
            if (database === "SEQUELIZE") {
                const filas = await Servicios.count({
                    where: {
                        id_servicio:{
                            [Op.like]: id
                        }
                    }
                })
                return filas
            }
        } catch (error) {
            console.log(error.message)
        }
    }
    // registra un unico registro en la base de datos
    static async create(servicio){
        try {
            // funcion para las bases de datos de sequelize
            if (database === "SEQUELIZE") {
                // guardar en la base de datos
                const result = await Servicios.create({
                    id_servicio: servicio.id,
                    nombre_servicio: servicio.nombre,
                    descripcion_servicio: servicio.descripcion,
                    tipo_servicio: servicio.tipo,
                    categoria_servicio: servicio.categoria,
                    plataforma_servicio: servicio.plataforma
                }, { fields: [
                        'id_servicio',
                        'nombre_servicio',
                        'descripcion_servicio',
                        'tipo_servicio',
                        'categoria_servicio',
                        'plataforma_servicio'
                    ]}
                )
                return result
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    // elimina un registro en la base de datos
    static async delete(id){
        try {
            // funcion para las bases de datos de sequelize
            if (database === "SEQUELIZE") {
                // guardar en la base de datos
                const servicio = await Servicios.destroy(
                    { where: { id_servicio: id } }
                )
                return servicio
            }
        } catch (error) {
            console.log(error.message)
        }
    }
    // devuelve los registros que contienen un nombre, tipo, categoria y plataforma
    static async findServicioExist(nombre, tipo, categoria, plataforma){
        try {
            // funcion para las bases de datos de sequelize
            if (database === "SEQUELIZE") {
                const servicio = await Servicios.findOne({
                    where:{
                        nombre_servicio: nombre,
                        plataforma_servicio: plataforma,
                        categoria_servicio:categoria,
                        tipo_servicio: tipo
                    }
                })
                return servicio
            }
        } catch (error) {
            console.log(error.message)
        }
    }
}


