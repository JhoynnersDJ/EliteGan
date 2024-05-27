const TOKEN_SECRET = process.env.TOKEN_SECRET;
import jwt from "jsonwebtoken";

export const authRequired  = (req, res, next) => {
    // obtiene el usuario del request
    const authHeader = req.headers['authorization']; // Cambiado a minúsculas
    const authToken = authHeader && authHeader.split(' ')[1]; // Asegúrate de obtener el token correcto
    
    // si no hay usuario lanza un error
    if (!authToken) return res.status(401).json({message: "No hay Token, autorizacion denegada"});
    
    // se verifica el token
    jwt.verify(authToken, TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({message: "Token invalido"});
        req.user = user;
        next();
    });
}
export const authRequired2  = (req, res, next) => {
    //obtiene el usuario del request
    
    const [authToken] = req.cookies;
    
    //si no hay usuario lanza un error
    if (!authToken) return res.status(401).json({message: "No hay Token, autorizacion denegada"});
    
    //se verifica el token
    jwt.verify(authToken,TOKEN_SECRET, (err, user) => {
           
        if (err) return res.status(403).json({message: "Token invalido"});

        req.user = user
        
        next()
    })
   
}