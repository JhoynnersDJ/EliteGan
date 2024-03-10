import { Servicio } from "../model/servicioModel.js" // Funciones a diferentes bases de datos
import date from "date-and-time"
// import { Servicios } from '../../../database/hormiwatch/asociaciones.js'

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
            const {nombre, tipo, categoria, plataforma } = req.body
            let { descripcion } = req.body
            // si descripcion es una cadena vacia
            if (descripcion === "") descripcion = null
            // generar id de servicio
            const id = "123" 

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
}

export default ServicioController