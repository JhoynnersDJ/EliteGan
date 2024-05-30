import {user} from "../../usuarios/model/UserModel.js";
import {Auditoria} from "../model/AuditoriaModel.js";

export class AuditoriaController {
    static resgistrarAccion = (accion, modulo, datos) => async (req, res) => {

        const {id_usuario} = req.user;
        const userFound = await user.findOneById(id_usuario);
        const auditoria = new Auditoria(
            `${userFound.nombre} ${userFound.apellido}`,
            userFound.rol.nombre_rol,
            `Se ha ${accion} en el siguiente item: ${modulo}`,
            datos
        );
        await Auditoria.create(auditoria);
        return;
        //console.log(auditoria);
        
    }

    static async index (req,res) {
        const {id} = req.params;
        const auth = await Auditoria.getById(id);
        console.log(auth)
        return res.status(200).json(auth);
    }
}