import { user, userRol } from "./UserModel.js";
import { Roles } from "../../../database/hormiwatch/asociaciones.js";
import { Usuarios } from "../../../database/hormiwatch/asociaciones.js";
import { EstadoUsuarios } from "../../../database/hormiwatch/asociaciones.js";
import fs from "fs";
import {sendEmail} from "../../../middlewares/sendEmail.js"

import "dotenv/config";
import nodemailer from "nodemailer";

import ibmdb from "ibm_db";

const dbSelect = process.env.SELECT_DB;
var emailTemp = null;
let connStr =
  "DATABASE=" +
  process.env.DATABASE +
  ";HOSTNAME=" +
  process.env.HOSTNAME +
  ";UID=" +
  process.env.UID +
  ";PWD=" +
  process.env.PWD +
  ";PORT=" +
  process.env.PORT_DB2 +
  ";PROTOCOL=" +
  process.env.PROTOCOL;

//guarda al Usuarios para persistencia
async function saveUser(user) {
  try {
    if (dbSelect == "SEQUELIZE") {
      const rol = await Roles.findOne({
        where: { nombre_rol: "Tecnico" },
      });
      //console.log(rol)
      if (!rol) return null;

      const estado = await EstadoUsuarios.findOne({
        where: { nombre_estado_usuario: "verificado" },
      });
      //console.log(rol)
      if (!estado) return null;

      const user1 = await Usuarios.create(
        {
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          password: user.password,
          id_rol: rol.dataValues.id_rol,
          empresa: user.empresa,
          cargo: user.cargo,
          telefono: user.telefono,
          departamento: user.departamento,
          id_usuario: user.id_usuario,
          id_estado_usuario: estado.id_estado_usuario,
          cedula: user.cedula,
        },
        {
          fields: [
            "nombre",
            "apellido",
            "email",
            "password",
            "id_rol",
            "empresa",
            "cargo",
            "telefono",
            "departamento",
            "id_usuario",
            "id_estado_usuario",
            "cedula",
          ],
        }
      );

      return new userRol(
        rol.dataValues.id_rol,
        rol.dataValues.nombre_rol,
        rol.dataValues.descripcion_rol
      );
    }

    //DB2

    if (dbSelect == "DB2") {
      var rol2 = await new Promise((resolve, reject) => {
        ibmdb.open(connStr, async (err, conn) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            try {
              const data = await conn.query(
                "SELECT * FROM TECNICO.ROL WHERE NOMBRE = ?;",
                ["usuario"]
              );
              await conn.query(
                "INSERT INTO TECNICO.USUARIO (ID_US, NOMBRE, APELLIDO, EMAIL, NUM_TEL, PASSWORD, EMPRESA, CARGO, DEPARTAMENTO, TOKEN, ULTIMA_CONEXION, ID_ROLREF) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                  user.id_us,
                  user.nombre,
                  user.apellido,
                  user.email,
                  user.num_tel,
                  user.password,
                  user.empresa,
                  user.cargo,
                  user.departamento,
                  null,
                  null,
                  data[0].ID_ROL,
                ]
              );
              conn.close(() => {
                // console.log('done');
              });
              console.log(data[0]);
              resolve(data[0]);
            } catch (err) {
              console.log(err);
              reject(err);
            }
          }
        });
      });

      return new userRol(rol2.ID_ROL, rol2.NOMBRE_ROL, rol2.DESCRIPCION);
    }
    return null;
  } catch (error) {
    console.log(error);
  }

  //users.users.push(user);
}

async function verificado(email) {
  if (dbSelect == "SEQUELIZE") {
    const user1 = await Usuarios.findOne({
      where: { email: email },
    });
    //console.log(user1);
    if (!user1) return null;
    const estado = await EstadoUsuarios.findOne({
      where: { id_estado_usuario: user1.dataValues.id_estado_usuario },
    });
    //console.log(rol)
    if (!estado) return null;
    return estado.nombre_estado_usuario === "verificado";
  }
  return null;
}

//busca en la lista de usuarios un email pasado por parametro
async function findOne(email) {
  if (dbSelect == "SEQUELIZE") {
    const user1 = await Usuarios.findOne({
      where: { email: email },
    });
    //console.log(user1);
    if (!user1) return null;
    const rol = await Roles.findOne({
      where: { id_rol: user1.dataValues.id_rol },
    });
    return new user(
      user1.dataValues.nombre,
      user1.dataValues.apellido,
      user1.dataValues.email,
      user1.dataValues.password,
      user1.dataValues.telefono,
      user1.dataValues.empresa,
      user1.dataValues.cargo,
      user1.dataValues.departamento,
      new userRol(
        rol.dataValues.id_rol,
        rol.dataValues.nombre_rol,
        rol.dataValues.descripcion_rol
      ),
      user1.dataValues.id_usuario,
      user1.dataValues.id_estado_usuario,
      user1.dataValues.cedula,
      user1.dataValues.token,
      user1.dataValues.foto_perfil
    );
  }

  //DB2

  if (dbSelect == "DB2") {
    var user2 = await new Promise((resolve, reject) => {
      ibmdb.open(connStr, async (err, conn) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          try {
            const data = await conn.query(
              "SELECT ROL.NOMBRE AS NOMBRE_ROL,USU.NOMBRE AS NOMBRE_USU,* FROM TECNICO.USUARIO AS USU JOIN TECNICO.ROL AS ROL ON USU.ID_ROLREF = ROL.ID_ROL WHERE EMAIL = ?;",
              [email]
            );
            conn.close(() => {
              // console.log('done');
            });
            resolve(data[0]);
          } catch (err) {
            console.log(err);
            reject(err);
          }
        }
      });
    });
    if (!user2) return null;
    return new user(
      user2.NOMBRE_USU,
      user2.APELLIDO,
      user2.EMAIL,
      user2.PASSWORD,
      user2.NUM_TEL,
      user2.EMPRESA,
      user2.CARGO,
      user2.DEPARTAMENTO,
      new userRol(user2.ID_ROL, user2.NOMBRE_ROL, user2.DESCRIPCION),
      user2.ID_US
    );
  }

  return null;
  //return users.users.find((users) => users.email == email);
}

async function saveProfilePhoto(id_usuario, file){   
  console.log(file) 
  //const bitmap = fs.readFileSync(file);
  const buf = Buffer.from(file);
  const userFound2 = await Usuarios.findByPk(id_usuario);
  userFound2.foto_perfil = buf;
  userFound2.save()
  return userFound2;
  /*const buf2 = Buffer.from(userFound2.foto_perfil, 'binary');
  fs.writeFileSync("copia.png", buf2)*/
}

//devuelve un objeto tipi Usuarios por id
async function findOneById(id) {
  if (dbSelect == "SEQUELIZE") {
    const user1 = await Usuarios.findByPk(id).catch((error) => {
      console.error("Failed to retrieve data : ", error);
    });

    if (!user1) return null;

    const rol = await Roles.findOne({
      where: { id_rol: user1.dataValues.id_rol },
    });

    if (!rol) return null;

    return new user(
      user1.dataValues.nombre,
      user1.dataValues.apellido,
      user1.dataValues.email,
      user1.dataValues.password,
      user1.dataValues.telefono,
      user1.dataValues.empresa,
      user1.dataValues.cargo,
      user1.dataValues.departamento,
      new userRol(
        rol.dataValues.id_rol,
        rol.dataValues.nombre_rol,
        rol.dataValues.descripcion_rol
      ),
      user1.dataValues.id_usuario,
      user1.dataValues.id_estado_usuario,
      user1.dataValues.cedula,
      user1.dataValues.token
    );
  }
  //DB2
  if (dbSelect == "DB2") {
    var user2 = await new Promise((resolve, reject) => {
      ibmdb.open(connStr, async (err, conn) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          try {
            const data = await conn.query(
              "SELECT ROL.NOMBRE AS NOMBRE_ROL,USU.NOMBRE AS NOMBRE_USU,* FROM TECNICO.USUARIO AS USU JOIN TECNICO.ROL AS ROL ON USU.ID_ROLREF = ROL.ID_ROL WHERE USU.ID_US = ?;",
              [id]
            );
            conn.close(() => {
              // console.log('done');
            });
            resolve(data[0]);
          } catch (err) {
            console.log(err);
            reject(err);
          }
        }
      });
    });

    if (!user2) return null;
    return new user(
      user2.NOMBRE_USU,
      user2.APELLIDO,
      user2.EMAIL,
      user2.PASSWORD,
      user2.NUM_TEL,
      user2.EMPRESA,
      user2.CARGO,
      user2.DEPARTAMENTO,
      new userRol(user2.ID_ROL, user2.NOMBRE_ROL, user2.DESCRIPCION),
      user2.ID_US
    );
  }

  return null;
  //return users.users.find((users) => users.id == id);
}

//actualiza el rol del Usuarios cuyo email se paso por el req.body
async function updateRol(rol, email) {
  if (dbSelect == "SEQUELIZE") {
    const rolFound = await Roles.findOne({
      where: { nombre_rol: rol },
    });

    if (!rolFound) return null;

    const user1 = await Usuarios.findOne({
      where: { email: email },
    });

    if (!user1) return null;

    user1.id_rol = rolFound.id_rol;

    user1.save();

    return new user(
      user1.dataValues.nombre,
      user1.dataValues.apellido,
      user1.dataValues.email,
      user1.dataValues.password,
      user1.dataValues.telefono,
      user1.dataValues.empresa,
      user1.dataValues.cargo,
      user1.dataValues.departamento,
      new userRol(
        rolFound.dataValues.id_rol,
        rolFound.dataValues.nombre_rol,
        rolFound.dataValues.descripcion_rol
      ),
      user1.dataValues.id_usuario,
      user1.dataValues.id_estado_usuario,
      user1.dataValues.cedula
    );
  }

  //DB2
  if (dbSelect == "DB2") {
    var user2 = await new Promise((resolve, reject) => {
      ibmdb.open(connStr, async (err, conn) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          try {
            const data = await conn.query(
              "SELECT * FROM TECNICO.ROL WHERE NOMBRE = ?;",
              [rol]
            );
            if (!data[0]) return null;
            await conn.query(
              "UPDATE TECNICO.USUARIO AS USU SET USU.ID_ROLREF = ? WHERE USU.EMAIL = ?;",
              [data[0].ID_ROL, email]
            );
            const user1 = await conn.query(
              "SELECT ROL.NOMBRE AS NOMBRE_ROL,USU.NOMBRE AS NOMBRE_USU,* FROM TECNICO.USUARIO AS USU JOIN TECNICO.ROL AS ROL ON USU.ID_ROLREF = ROL.ID_ROL WHERE EMAIL = ?;",
              [email]
            );
            conn.close(() => {
              // console.log('done');
            });
            resolve(user1[0]);
          } catch (err) {
            console.log(err);
            reject(err);
          }
        }
      });
    });

    return new user(
      user2.NOMBRE_USU,
      user2.APELLIDO,
      user2.EMAIL,
      user2.PASSWORD,
      user2.NUM_TEL,
      user2.EMPRESA,
      user2.CARGO,
      user2.DEPARTAMENTO,
      new userRol(user2.ID_ROL, user2.NOMBRE_ROL, user2.DESCRIPCION),
      user2.ID_US
    );
  }

  return null;
}

async function updateToken(token, id) {
  if (dbSelect == "SEQUELIZE") {
    const userFound = await Usuarios.findByPk(id);

    if (!userFound) return null;
    userFound.token = token;

    return userFound.save();
  }
}

async function sendEmailToken(token, email, nombre) {
  emailTemp = email; 
  console.log(email)
  const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Título de la Página</title>
          <style>
              body {
                  margin: 0;
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
              }
      
              header {
                  background-color: #333;
                  padding-left: 4vh;
                  padding-right: 10vh;
                  padding-top: 2%;
                  padding-bottom: 2%;
              }
      
              h1 {
                  color: white;
                  font-size: 5vh;
              }
      
              h2 {
                  font-weight: bold;
                  margin-left: 5%;
                  margin-top: 10px;
                  font-size: 24px;
                  margin-right: 5%;
              }
      
              p {
                  margin-left: 5%;
                  font-size: 16px;
                  line-height: 1.5;
                  margin-right: 5%;
                  margin-top: 20px;
                  font-size: 18px;
                  color: #333;
                  line-height: 1.5;
                  text-align: justify;
              }
      
              .token-container {
                  background-color: #666;
                  color: #fff;
                  padding: 10px;
                  border-radius: 5px;
                  font-size: 18px;
                  margin-top: 10px;
                  text-align: center;
              }
      
              .token {
                  font-size: 24px;
                  font-weight: bold;
                  color: orange;
              }
      
              .container {
                    max-width: 900px;
                    margin: 0 auto;
                    background-color: #fff;
                    border-radius: 5px;
                    box-shadow: 0 0 10px #f2f2f2;
                  }
              .span1 {
                  color: orange
              }
          </style>
      </head>
      <body style="padding: 20px;">
          <div class="container">
              <header>
                  <h1>Hormi<span class="span1">Watch</span>
              </header>
              <h2>Bienvenido a HormiWatch</h2>
              <p>Hola <span class="span1">${nombre}</span>!</p>
             
              <p>
                  El siguiente correo es para la actualización de su cuenta de correo electrónico.
                  Ingrese el siguiente Código de Verificación, en la aplicación para validar el cambio.                  
              </p>
              <div class="token-container">
                  <span class="token">${token}</span>
              </div>
              <hr>  
          </div>
      </body>
      </html>    
      `;
  await sendEmail(htmlContent,email, "Actualización de Correo Electronico");
  

  
}

async function updateEmail(id, email) {
  if (dbSelect == "SEQUELIZE") {
    const user1 = await Usuarios.findByPk(id);

    if (!user1) return null;    

    user1.email = email;
    user1.token = token;
    user1.save()
    return new user(
      user1.dataValues.nombre,
      user1.dataValues.apellido,
      user1.dataValues.email,
      user1.dataValues.password,
      user1.dataValues.telefono,
      user1.dataValues.empresa,
      user1.dataValues.cargo,
      user1.dataValues.departamento,
      null,
      user1.dataValues.id_usuario,
      user1.dataValues.id_estado_usuario,
      user1.dataValues.cedula
    );;
  }
}

async function updateVerificar(ver, id) {
  if (dbSelect == "SEQUELIZE") {
    const userFound = await Usuarios.findByPk(id);

    if (!userFound) return null;

    const estado = await EstadoUsuarios.findOne({
      where: { nombre_estado_usuario: ver },
    });
    //console.log(rol)
    if (!estado) return null;

    userFound.id_estado_usuario = estado.id_estado_usuario;
    userFound.save();
    return userFound;
  }
}

async function getByRol() {
  if (dbSelect == "SEQUELIZE") {
    const rol = await Roles.findOne({
      where: { nombre_rol: "Tecnico" },
    });

    if (!rol) return null;

    const userFound = await Usuarios.findAll({
      where: { id_rol: rol.id_rol },
    });

    if (userFound.length === 0 || !userFound) return [];
    
    const fromatedUser = userFound.map(
      (users) => ({
      id_usuario:  users.id_usuario,
      nombre: users.nombre,
      apellido: users.apellido,      
      
      })
      
    );
    

    return fromatedUser;
  }
}

async function updateState(state, id) {
  if (dbSelect == "SEQUELIZE") {
    const estado = await EstadoUsuarios.findOne({
      where: { nombre_estado_usuario: state },
    });
    //console.log(rol)
    if (!estado) return null;

    const user1 = await Usuarios.findOne({
      where: { id_usuario: id },
    });

    if (!user1) return null;

    user1.id_estado_usuario = estado.id_estado_usuario;

    user1.save();

    return new user(
      user1.dataValues.nombre,
      user1.dataValues.apellido,
      user1.dataValues.email,
      user1.dataValues.password,
      user1.dataValues.telefono,
      user1.dataValues.empresa,
      user1.dataValues.cargo,
      user1.dataValues.departamento,
      null,
      user1.dataValues.id_usuario,
      state,
      user1.dataValues.cedula
    );
  }
}

async function updateUser(usuario) {
  if (dbSelect == "SEQUELIZE") {
    const userFound = await Usuarios.findByPk(usuario.id_usuario);

    if (!userFound) return null;

    if(usuario.nombre) userFound.nombre = usuario.nombre;
    if(usuario.apellido) userFound.apellido = usuario.apellido;
    if(usuario.telefono) userFound.telefono = usuario.telefono;
    if(usuario.empresa) userFound.empresa = usuario.empresa;
    if(usuario.cargo) userFound.cargo = usuario.cargo;
    if(usuario.departamento) userFound.departamento = usuario.departamento;
    if(usuario.cedula) userFound.cedula = usuario.cedula;
    userFound.save();

    return new user(
      userFound.nombre,
      userFound.apellido,
      userFound.email,
      userFound.password,
      userFound.telefono,
      userFound.empresa,
      userFound.cargo,
      userFound.departamento,
      userFound.id_rol,
      userFound.id_usuario,
      userFound.id_estado_usuario,
      userFound.cedula
    );
  }
}

async function updatePassword(id, password) {
  if (dbSelect == "SEQUELIZE") {
    
    const user1 = await Usuarios.findByPk(id);
    
    if (!user1) return null;

    user1.password = password;  
    user1.token = null;  
    
    const newUser = new user(
      user1.dataValues.nombre,
      user1.dataValues.apellido,
      user1.dataValues.email,
      user1.dataValues.password,
      user1.dataValues.telefono,
      user1.dataValues.empresa,
      user1.dataValues.cargo,
      user1.dataValues.departamento,
      null,
      user1.dataValues.id_usuario,
      user1.dataValues.id_estado_usuario,
      user1.dataValues.cedula
    );
    user1.save()
    return newUser;
  }
}

async function sendEmailTokenPassword(token, email, nombre) {  
  console.log(email)
  const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Título de la Página</title>
          <style>
              body {
                  margin: 0;
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
              }
      
              header {
                  background-color: #333;
                  padding-left: 4vh;
                  padding-right: 10vh;
                  padding-top: 2%;
                  padding-bottom: 2%;
              }
      
              h1 {
                  color: white;
                  font-size: 5vh;
              }
      
              h2 {
                  font-weight: bold;
                  margin-left: 5%;
                  margin-top: 10px;
                  font-size: 24px;
                  margin-right: 5%;
              }
      
              p {
                  margin-left: 5%;
                  font-size: 16px;
                  line-height: 1.5;
                  margin-right: 5%;
                  margin-top: 20px;
                  font-size: 18px;
                  color: #333;
                  line-height: 1.5;
                  text-align: justify;
              }
      
              .token-container {
                  background-color: #666;
                  color: #fff;
                  padding: 10px;
                  border-radius: 5px;
                  font-size: 18px;
                  margin-top: 10px;
                  text-align: center;
              }
      
              .token {
                  font-size: 24px;
                  font-weight: bold;
                  color: orange;
              }
      
              .container {
                    max-width: 900px;
                    margin: 0 auto;
                    background-color: #fff;
                    border-radius: 5px;
                    box-shadow: 0 0 10px #f2f2f2;
                  }
              .span1 {
                  color: orange
              }
          </style>
      </head>
      <body style="padding: 20px;">
          <div class="container">
              <header>
                  <h1>Hormi<span class="span1">Watch</span>
              </header>
              <h2>Bienvenido a HormiWatch</h2>
              <p>Hola <span class="span1">${nombre}</span>!</p>
             
              <p>
                  El siguiente correo es para la recuperacion de la contraseña de su cuenta.
                  Ingrese el siguiente Código de Verificación, en la aplicación para validar el cambio.                  
              </p>
              <div class="token-container">
                  <span class="token">${token}</span>
              </div>
              <hr>  
          </div>
      </body>
      </html>    
      `;
  await sendEmail(htmlContent,email, "Actualización de Contraseña");
  

  
}
/*async function sendSMSToken(token,num_tel, nombre) {
  const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  return client.messages.create({body: 'Hola que tal, si necesitas algo me avisas', from: process.env.PHONE_NUMBER, to:'+584128027107'})
  .then(
    message => {
      console.log(message, "message send")
    }
  ).catch(
    err => {
      console.log(err, "zmessage not send")
    }
  )
}*/

export default class userFunction {
  users = [];
  static save(user) {
    return saveUser(user);
    //console.log(users);
  }

  static findOne(email) {
    return findOne(email);
  }

  static verificado(email) {
    return verificado(email);
  }

  static findOneById(id) {
    return findOneById(id);
  }

  static updateRol(rol, email) {
    return updateRol(rol, email);
  }

  static updateToken(token, id) {
    return updateToken(token, id);
  }

  static sendEmailToken(token, email, nombre) {
    return sendEmailToken(token, email, nombre);
  }

  static updateEmail(id, email) {
    return updateEmail(id, email);
  }

  static updateVerificar(ver, id) {
    return updateVerificar(ver, id);
  }
  static getByRol() {
    return getByRol();
  }
  static updateState(state, id) {
    return updateState(state, id);
  }
  static saveProfilePhoto(id_usuario, file) {
    return saveProfilePhoto(id_usuario, file);
  }
  static updateUser(user) {
    return updateUser(user);
  }

  static updatePassword(id, password) {
    return updatePassword(id, password);
  }

  static sendEmailTokenPassword(token, email, nombre) {
    return sendEmailTokenPassword(token, email, nombre);
  }
}
