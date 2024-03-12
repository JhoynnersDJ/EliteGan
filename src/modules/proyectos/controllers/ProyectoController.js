import { Proyecto } from "../model/ProyectoModel.js";
import { user } from "../../usuarios/model/UserModel.js";
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
                return res.status(404).json({ message: 'Proyecto no encontrado' })
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
            console.log(userFound)
            if (!userFound) {
                return res.status(404).json({ message: 'Usuario no encontrado' })
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
// nombre, tarifa, pool_horas, fecha_fin, responsable_cliente, tecnicos[]
// autogenerar id, status = 0, fecha_inicio
static async create(req, res) {
    try {
        // capturar datos
        const { tarifa, id_usuario, status, id_responsable_cliente, nombre } = req.body
        let { id_responsable_tecnico } = req.body

        // eliminar espacios en blanco del string
        const nombreProyecto = nombre.trim();

        // si id_responsible_technician es una cadena vacia
        if (id_responsable_tecnico === "") {
            id_responsable_tecnico = null;
        }

        // verificar si id del tecnico responsable es null o undefined
        if ((id_responsable_tecnico != undefined) && !id_responsable_tecnico) {
            // comprobar si existe el responsable tecnico
            const technicianFound = await ResponsableTecnico.findByPk(id_responsable_tecnico)
            if (!technicianFound) {
                return res.status(404).json({ message: 'Responsable técnico no encontrado' })
            }
        }

        // comprobar si existe el usuario
        const userFound = await Usuario.findByPk(id_usuario)
        if (!userFound) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }

        // comprobar si existe el responsable cliente
        const responsableClienteFound = await ReplicaResponsableCliente.findByPk(id_responsable_cliente)
        if (!responsableClienteFound) {
            return res.status(404).json({ message: 'Responsable cliente no encontrado' })
        }

        // verificar que no exista otro proyecto con el mismo nombre para el mismo cliente
        const proyectoExistente = await Proyecto.findOne({
            where: {
                nombre_proyecto: nombre,
                id_responsable_cliente_fk: id_responsable_cliente
            }
        })

        if (proyectoExistente) {
            return res.status(400).json({ message: 'El responsable cliente ya tiene un proyecto con el mismo nombre' })
        }

        // fecha de inicio
        const now = new Date()
        const fecha_inicio = date.format(now, 'YYYY-MM-DD')

        // guardar en la base de datos
        await Proyecto.create(
            { tarifa, nombre_proyecto: nombre, id_responsable_tecnico_fk: id_responsable_tecnico, id_usuario_fk: id_usuario, id_responsable_cliente_fk: id_responsable_cliente, status, fecha_inicio, total_proyecto: 0 },
            { fields: ['tarifa', 'status', 'nombre_proyecto', 'id_responsable_tecnico_fk', 'id_usuario_fk', 'id_responsable_cliente_fk', 'fecha_inicio', 'total_proyecto'] }
        )

        // Contar los proyectos asociados al usuario
        const contadorProyectos = await Proyecto.count({
            where: { id_usuario_fk: id_usuario }
        });

        // Actualizar el contador en la tabla de usuarios
        await Usuario.update(
            { contador_proyectos: contadorProyectos },
            { where: { id_us: id_usuario } }
        );

        res.status(201).json({ message: 'Proyecto creado correctamente' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

    

    // actualiza un proyecto
    static async update(req, res) {
        try {
            // capturar datos
            const { id } = req.params
            const { hourly_rate, name, id_user, status, start_date, id_client } = req.body
            let { id_responsible_technician } = req.body
            // comprobar si existe el proyecto
            const projectFound = await Proyecto.findByPk(id)
            if (!projectFound) {
                return res.status(404).json({ message: 'Proyecto no encontrado' })
            }
            // comprobar si existe el responsable tecnico
            const technicianFound = await ResponsableTecnico.findByPk(id_technician)
            if (!technicianFound) {
                return res.status(404).json({ message: 'Responsable técnico no encontrado' })
            }
            // si id_responsible_technician es una cadena vacia
            if (id_responsible_technician === "") {
                id_responsible_technician = null
            }
            // verificar si id del tecnico responsable es null o undefined
            if ((id_responsible_technician != undefined) && !id_responsible_technician) {
                // comprobar si existe el responsable tecnico
                const technicianFound = await ResponsableTecnico.findByPk(id_responsible_technician)
                if (!technicianFound) {
                    return res.status(404).json({ message: 'Responsable técnico no encontrado' })
                }
            }
            // comprobar si existe el usuario
            const userFound = await Usuario.findByPk(id_user)
            if (!userFound) {
                return res.status(404).json({ message: 'Usuario no encontrado' })
            }
            // comprobar si existe el cliente
            const clientFound = await ClienteReplica.findByPk(id_client)
            if (!clientFound) {
                return res.status(404).json({ message: 'Cliente no encontrado' })
            }
            // guardar el proyecto en la base de datos
            await Proyecto.update(
                { tarifa: hourly_rate, nombre_proyecto: name, id_responsable_tecnico_fk: id_responsible_technician, id_usuario_fk: id_user, id_cliente_fk: id_client, status, fecha_inicio: start_date },
                { where: { id_proyecto: id } }
            )
            res.status(200).json({ message: 'Proyecto actualizado correctamente' })
        } catch (error) {
            res.status(500).json({ message: error.message });
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
                return res.status(404).json({ message: 'Proyecto no encontrado' })
            }
            // eliminar un proyecto de la base de datos
            await Proyecto.destroy(
                { where: { id_proyecto: id } }
            )
            res.status(200).json({ message: 'Proyecto eliminado correctamente' })
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}


export default ProyectoController