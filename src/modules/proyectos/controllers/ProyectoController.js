import { Proyecto } from "../model/ProyectoModel.js";
import { user } from "../../usuarios/model/UserModel.js";
import { ResponsableClienteReplica } from "../../responsables_clientes/model/responsable_clienteModel.js";
import date from 'date-and-time';

class ProyectoController {
    // devuelve todos los registros
    static async index(req, res) {
        try {
            // Buscar todos los registros
            const proyectos = await Proyecto.findAll();
            // si no se encuentran registros en la base de datos
            if (!proyectos) {
                return res.status(204).json({ message: 'No hay proyectos registrados' });
            }
            // devuelve una respuesta
            res.status(200).json(proyectos)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    // devuelve un unico registro segun su primary key
    static async getById(req, res) {
        try {
            // capturar id de proyecto
            const { id } = req.params
            // buscar el proyecto segun su id junto con los datos de sus modelos asociados
            const proyecto = await Proyecto.findByPk(id)
            // comprobar si existe el proyecto
            if (!proyecto) {
                return res.status(404).json({
                    code: 'Recurso no encontrado',
                    message: 'Proyecto no encontrado',
                    details: 'Proyecto con el id '+ id +' no se encuentra en la base de datos',
                    timestamp: date.format(new Date(),  'YYYY-MM-DDTHH:mm:ss'),
                    requestID: id
                })
            }
            res.status(200).json(proyecto)
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // devuelve los proyectos segun el id usuario
    static async getByUser(req, res) {
        try {
            // capturar id de usuario
            const { id } = req.params
            // comprobar si existe el usuario
            const userFound = await user.findOneById(id)
            if (!userFound) {
                return res.status(404).json({
                    code: 'Recurso no encontrado',
                    message: 'Usuario no encontrado',
                    details: 'Usuario con el id '+ id +' no se encuentra en la base de datos',
                    timestamp: date.format(new Date(),  'YYYY-MM-DDTHH:mm:ss'),
                    requestID: id
                })
            }
            // buscar el proyecto segun el id del usuario
            const proyectos = await Proyecto.findByUser(id)
            // si no se encuentran proyectos
            if (!proyectos) {
                return res.status(204).json({message: 'Este usuario no tiene proyectos'})
            }
            // enviar los datos
            res.status(200).json(proyectos)
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }


// crear un proyecto
static async create(req, res) {
    try {
        // capturar 
        const { tarifa, pool_horas, fecha_fin, id_responsable_cliente, tecnicos } = req.body
        let { nombre } = req.body
        // eliminar espacios en blanco del string
        nombre = nombre.trim();
        // establecer status false/0
        const status = 0
        // comprobar si existe el usuario
        for (const tecnico of tecnicos) {
            const usuario = await user.findOneById(tecnico.id_usuario);
            console.log(usuario)
            if (!usuario) {
                return res.status(404).json({
                    code: 'Recurso no encontrado',
                    message: 'Id de usuario no encontrado',
                    details: `Usuario con el id '+ ${tecnico.id_usuario} + ' no se encuentra en la base de datos`,
                    timestamp: date.format(new Date(),  'YYYY-MM-DDTHH:mm:ss'),
                    requestID: tecnico.id_usuario
                })
            }
        }
        // comprobar si existe el responsable cliente
        const responsableClienteFound = await ResponsableClienteReplica.findByPk(id_responsable_cliente)
        if (!responsableClienteFound) {
            return res.status(404).json({
                code: 'Recurso no encontrado',
                message: 'Responsable cliente no encontrado',
                details: 'El responsable cliente con el id '+ id_responsable_cliente + ' no se encuentra en la base de datos',
                timestamp: date.format(new Date(),  'YYYY-MM-DDTHH:mm:ss'),
                requestID: id_responsable_cliente
            })
        }
        // verificar que no exista otro proyecto con el mismo nombre para el mismo cliente
        const proyectoExistente = await Proyecto.findOneName(nombre, id_responsable_cliente)
        if (proyectoExistente) {
            return res.status(400).json({ message: 'El responsable cliente ya tiene un proyecto con el mismo nombre' })
        }
        // fecha de inicio
        const now = new Date()
        const fecha_inicio = date.format(now, 'YYYY-MM-DD')
        // fecha_fin
        let fin = new Date(fecha_fin)
        fin = date.format(fin, 'YYYY-MM-DD')
        if (fin < fecha_inicio) {
            return res.status(400).json({ message: 'Fecha de fin no válida, verifique que sea posterior a la fecha de creación' },{
                code: 'Bad Request',
                message: 'Fecha inválida',
                details: 'La fecha de finalización debe ser posterior a la fecha de creación',
                timestamp: date.format(new Date(),  'YYYY-MM-DDTHH:mm:ss'),
                requestID: fecha_fin
            })
        }
        // instanciar un objeto de la clase Servicio
        const proyecto = new Proyecto(
            nombre,
            tarifa,
            status,
            pool_horas,
            fecha_inicio,
            fecha_fin,
            id_responsable_cliente,
            tecnicos
        )
        // guardar en la base de datos y actualiza la tabla asignaciones
        await Proyecto.create(proyecto)
        res.status(201).json({ message: 'Proyecto creado correctamente' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

    // eliminar un proyecto
    static async delete(req, res) {
        try {
            // capturar id de proyecto
            const { id } = req.params
            // comprobar si existe el proyecto
            const projectFound = await Proyecto.findByPk(id)
            if (!projectFound) {
                return res.status(404).json({
                    code: 'Recurso no encontrado',
                    message: 'Proyecto no encontrado',
                    details: 'Proyecto con el id '+ id +' no se encuentra en la base de datos',
                    timestamp: date.format(new Date(),  'YYYY-MM-DDTHH:mm:ss'),
                    requestID: id
                })
            }
            // eliminar un proyecto de la base de datos
            await Proyecto.delete(id)
            res.status(200).json({ message: 'Proyecto eliminado correctamente' })
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default ProyectoController