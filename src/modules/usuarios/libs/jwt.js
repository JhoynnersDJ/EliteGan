const TOKEN_SECRET = process.env.TOKEN_SECRET;
import jwt from "jsonwebtoken";

//funcion que crea el TOKEN para mantener iniciada la sesion
export function createAccessToken(payload){
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload, 
            TOKEN_SECRET,
            { 
                expiresIn: "1d",
            },
            (err, token) => {
                if (err) reject(err);  
                resolve(token);              
            }            
        );

    })
}
 