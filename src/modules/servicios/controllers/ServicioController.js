import { Servicio } from "../model/servicioModel.js" // Funciones a diferentes bases de datos
import date from "date-and-time"

class ServicioController {
    // devuelve todos los servicios
    static async index (req, res) {
        try {
            // buscar todos los registros
            const servicios = await Servicio.findAll()
            // si no se encuentran registros en la base de datos
            if (!servicios) {
                return res.status(204).json({message: 'No hay servicios registrados', data: [] })
            }
            // devuelve una respuesta
            res.status(200).json(servicios)
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // devuelve un servicio segun su ID
    static async getById (req, res){
        try {
            // capturar id de servicio
            const { id } = req.params
            // comprobar si existe
            const servicio = await Servicio.findByPk(id)
            // si no existe
            if (!servicio) {
                return res.status(404).json({
                    code: 'Recurso no encontrado',
                    message: 'Servicio no encontrado',
                    details: 'El servicio con el id '+ id + ' no se encuentra en la base de datos',
                    timestamp: date.format(new Date(),  'YYYY-MM-DDTHH:mm:ss'),
                    requestID: id
                })
            }
            // devuelve respuesta
            res.status(200).json(servicio)
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // crear un servicio
    static async create (req, res){
        try {
            // capturar datos
            const {categoria, plataforma } = req.body
            let { nombre, descripcion, tipo } = req.body
            // si descripcion es una cadena vacia
            if (descripcion === "") {
                descripcion = null
            }else{
                nombre = nombre.trim()
            }
            // si tipo es una cadena vacia
            if (tipo === ""){
                tipo = null
            }else{
                tipo = tipo.trim()
            }
            // comprobar si ya existe el servicio con el mismo nombre, tipo, categoria, plataforma
            const servicios = await Servicio.findServicioExist(nombre, tipo, categoria, plataforma)
            // console.log(servicios.dataValues.nombre_servicio)
            if (servicios) {
                return res.status(400).json({
                    message: 'Ya existe este servicio',
                    details: `El Servicio con los siguientes datos ya existe: nombre: ${servicios.nombre_servicio}, tipo: ${servicios.tipo_servicio}, categoria: ${servicios.categoria_servicio}, plataforma: ${servicios.plataforma_servicio}`,
                });
            }
            // primera letra plataforma
            const primera_letra_plataforma = plataforma.charAt(0)
            // primera letra categoria
            const primera_letra_categoria = categoria.charAt(0)
            // primera letra tipo
            let letra_tipo = null
            // si tipo es null toma el nombre
            if (!tipo) {
                letra_tipo = nombre.slice(0,3)
            } else {
                letra_tipo = tipo.charAt(0)
            }
            // generar id de servicio
            let id = null
            console.log(id)
            if (primera_letra_categoria == 'O' || primera_letra_categoria == 'o') {
                id = 'OTR-'
                console.log(id)
            }else{
                id = primera_letra_plataforma + primera_letra_categoria + letra_tipo + '-'
                console.log(id)
            }
            console.log(id)
            // cantidad de filas con ese patron
            let filas = await Servicio.findPatronId(id)
            // console.log(filas)
            filas = filas + 1
            // si supera el limite
            if (filas > 999) return res.status(500).json({ message: 'Se ha alcanzado el limite para esta categoria'})  
            filas = filas.toString().padStart(3, '0')
            id = id + filas
            // comprobar si el id se repite
            const servicioFound = await Servicio.findByPk(id)
            if (servicioFound) {
                return res.status(500).json({ message: '¡Ups! el id del servicio se repite'});
            }
            // instanciar un objeto de la clase Servicio
            const servicio = new Servicio(
                id,
                nombre,
                plataforma,
                categoria,
                tipo,
                descripcion
            )
            // guardar en la base de datos
            await Servicio.create(servicio)
            // devuelve respuesta
            res.status(201).json({ message: 'Servicio creado correctamente'})
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // eliminar un servicio
    static async delete(req, res) {
        try {
            // capturar id de servicio
            const { id } = req.params
            // comprobar si existe el servicio
            const servicioFound = await Servicio.findByPk(id)
            if (!servicioFound) {
                return res.status(404).json({
                    code: 'Recurso no encontrado',
                    message: 'Servicio no encontrado',
                    details: 'Servicio con el id '+ id +' no se encuentra en la base de datos',
                    timestamp: date.format(new Date(),  'YYYY-MM-DDTHH:mm:ss'),
                    requestID: id
                })
            }
            // eliminar un servicio de la base de datos
            await Servicio.delete(id)
            res.status(200).json({ message: 'Servicio eliminado correctamente' })
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default ServicioController