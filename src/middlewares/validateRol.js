const TOKEN_SECRET = process.env.TOKEN_SECRET;
import jwt from "jsonwebtoken";

export const rolRequired  = (rol, rol2, rol3) => (req, res, next) => {
    //obtiene el usuario del request
    const {authToken} = req.cookies;
    //console.log(token)
    //si no hay usuario lanza un error
    if (!authToken) return res.status(401).json({message: "No hay Token, autorizacion denegada"});
    
    //se verifica el token
    jwt.verify(authToken,TOKEN_SECRET, (err, user) => {
        
        //verificca si hay un error en el token
        if (err) return res.status(403).json({message: "Invalid Token"});

        //verifica si el usuario tiene el rol correccto
        if (rol !== user.rol && rol2 !== user.rol && rol3 !== user.rol) return res.status(403).json({message: "No tienes los permisos para acceder aquí"});
        
        req.user = user
        
        next()
    })
   
}
