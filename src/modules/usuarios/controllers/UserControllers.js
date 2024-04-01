import { user } from "../model/UserModel.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import jwt from "jsonwebtoken";
import { v4 } from "uuid";

const TOKEN_SECRET = process.env.TOKEN_SECRET;

//se registra el usuario y genera su id
export const register = async (req, res) => {
  const {
    nombre,
    apellido,
    email,
    password,
    telefono,
    empresa,
    departamento,
    cargo,
    cedula,
  } = req.body;

  try {
    //se busca el correo para saber si ya esta registrado
    const userFound = await user.findOne(email);

    //si se encuentra el email se da el siguiente mensaje de error
    if (userFound) return res.status(511).json(["The email alredy exists"]);

    //se cifra la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    //se genera el id unico del usuario
    let idUnico = v4();

    //se crea un nuevo usuario
    const newuser = new user(
      nombre,
      apellido,
      email,
      passwordHash,
      telefono,
      empresa,
      cargo,
      departamento,
      null,
      idUnico,
      null,
      cedula
    );

    //se guarda el usuario
    const userSaved = await user.save(newuser);
    //console.log(userSaved)
    if (!userSaved) res.status(406).json({ message: "ERROR AL CREAR USUARIO" });
    //se genera el token para ser manejado por la cookie
    const authToken = await createAccessToken({
      id_usuario: newuser.getUserId(),
      id_rol: userSaved.id_rol,
    });

    //se envia de respuesta el token yy los datos ingresados
    res.cookie("authToken", authToken);

    res.status(200).json({
      message: "Usuario creado exitosamente" 
    });
    //userFound = null;
    //newuser = null;
    //console.log(newuser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// inicia sesion el usuario
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    //busca al usuario por el email
    const userFound = await user.findOne(email);

    //si no se encuentra el email se da el siguiente mensaje de error
    if (!userFound)
      return res.status(511).json({ message: "Correo electronico no encontrado" });
    const verificado = await user.verificado(email);
    //si no se encuentra el email se da el siguiente mensaje de error
    if (!verificado)
      return res.status(511).json({ message: "Correo electronico no verificado" });

    //se decifra la contrase;a y se compara
    const isMatch = await bcrypt.compare(password, userFound.password);

    //si no son iguales da el mensaje de error
    if (!isMatch)
      return res.status(406).json({ message: "Contraseña incorrecta" });

    //se genera un token para ser manejado como una cookie
    const authToken = await createAccessToken({
      id_usuario: userFound.getUserId(),
      id_rol: userFound.getUserRol(),
    });

    //se envia de respuesta el token y los datos ingresados
    res.cookie("authToken", authToken);
    res.status(200).json({
      id: userFound.getUserId(),
      nombre: userFound.getUserName(),
      apellido: userFound.apellido,
      email: userFound.getUserEmail(),
      authToken: authToken,
      id_rol: userFound.getUserRol(),
      foto_perfil: userFound.foto_perfil,
    });
    //userFound = null;
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//finalizar sesion del usuario
export const logout = (req, res) => {
  if (!req.cookies.authToken)
    return res.status(511).json({ message: "No has iniciado sesion" });
  //se le agota el tiempo de vida de la cookie
  res.cookie("authToken", "", {
    expires: new Date(0),
  });
  res.status(200).json({ message: "Se cerro sesion exitosamente" });
};

//obtener datos del usuario
export const profile = async (req, res) => {
  const { id_usuario } = req.params;
  //busca al usuario por el id
  const userFound = await user.findOneById(id_usuario);

  //si no encuentra al usurio da el mensaje de error
  if (!userFound)
    return res.status(511).json({ message: "usuario no encontrado" });

  //manda una respuesta con los datos del usuario encontrados
  res.status(200).json({
    id_usuario: userFound.getUserId(),
    nombre: userFound.getUserName(),
    apellido: userFound.getUserLastName(),
    telefono: userFound.telefono,
    empresa: userFound.getUserEmpress(),
    departamento: userFound.getUserDepartament(),
    cargo: userFound.cargo,
    cedula: userFound.cedula,
    id_rol: userFound.getUserRol(),
  });
  //userFound = null;
};

//actualizar rol del usuario cuyo email es ingresado en el body
export const updateRol = async (req, res) => {
  //busca al usuario por el id

  const userAdmin = await user.findOneById(req.user.id_usuario);

  //si no encuentra al usurio da el mensaje de error
  if (!userAdmin) return res.status(202).json({ message: "User not found" });

  const { email, rol } = req.body;

  try {
    //busca al usuario por el email
    const userFound = await user.findOne(email);

    //si no se encuentra el email se da el siguiente mensaje de error
    if (!userFound)
      return res.status(404).json({ message: "usuario no encontrado" });

    const newuser = await user.updateRol(rol, email);

    if (!newuser) return res.status(404).json({ message: "rol no encontrado" });

    res.status(200).json({
      message: "Rol actualizado correctamente" 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//verificar el authToken
export const verifyToken = async (req, res) => {
  const { authToken } = req.cookies;

  if (!authToken) return res.status(406).json({ message: "Token invalido" });
  try {
    jwt.verify(authToken, TOKEN_SECRET, async (err, user2) => {
      if (err) return res.status(406).json({ message: "Token invalido" });

      const userFound = await user.findOneById(user2.id_usuario);

      if (!userFound) return res.status(404).json({ message: "Usuario no encontrado" });

      return res.json({
        id_usuario: userFound.id_us,
        nombre: userFound.nombre,
        email: userFound.email,
        id_rol: userFound.getUserRol(),
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//enviar el token por correo, verificado = false
export const updateEmailToken = async (req, res) => {
  const { authToken } = req.cookies;

  const { email, id_usuario } = req.body;

  //if (!authToken) return res.status(401).json({ message: "Invalid token" });
  try {
    const userFound2 = await user.findOne(email);

    if (userFound2) return res.status(404).json({ message: "Este Email ya se encuantra registrado" });

    const userFound = await user.findOneById(id_usuario);

    if (!userFound) return res.status(404).json({ message: "Usuario no encontrado" });

    const token = v4().split("-")[0];

    const tokenSaved = await user.updateToken(token, userFound.id_usuario);

    await user.updateVerificar("sin verificar", userFound.id_usuario);
    await user.sendEmailToken(token, email, userFound.nombre);

    return res.json({
      message: "Codigo de verificacion enviado al email",
      
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//actualizar correo con el token, verificado = true
export const updateEmail = async (req, res) => {
  const { authToken } = req.cookies;

  const { token, id_usuario, email } = req.body;

  //if (!authToken) return res.status(401).json({ message: "Invalid token" });
  try {
    const userFound = await user.findOneById(id_usuario);

    if (!userFound) return res.status(404).json({ message: "Usuario no encontrado" });

    if (userFound.token === token) {
      await user.updateVerificar("verificado", userFound.id_usuario);

      const userSaved = await user.updateEmail(userFound.id_usuario, email);
    } else {
      return res.status(401).json({ message: "Codigo de verificacion no coincide" });
    }
    res.cookie("authToken", "", {
      expires: new Date(0),
    });

    return res.json({
      message: "Email actualizado correctamente"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getByRol = async (req, res) => {
  //console.log(req.user)
  //busca al usuario por el id
  /*const userFound = await user.findOneById(req.user.id_usuario);

  //si no encuentra al usurio da el mensaje de error
  if (!userFound) return res.status(202).json({ message: "usuario no encontrado" });*/

  const userTecnico = await user.getByRol();

  //manda una respuesta con los datos del usuario encontrados
  res.status(200).json(userTecnico);
};

export const suspendUser = async (req, res) => {
  //busca al usuario por el id

  const userAdmin = await user.findOneById(req.user.id_usuario);

  //si no encuentra al usurio da el mensaje de error
  if (!userAdmin)
    return res.status(401).json({ message: "Usuario no encontrado" });

  const { id } = req.params;

  try {
    //busca al usuario por el email
    const userFound = await user.findOneById(id);

    //si no se encuentra el email se da el siguiente mensaje de error
    if (!userFound)
      return res.status(404).json({ message: "usuario no encontrado" });

    const newuser = await user.updateState("suspendido", id);

    if (!newuser)
      return res
        .status(404)
        .json({ message: "estado de usuario no encontrado" });

    res.status(200).json({
      message: "Usuario suspendido exitosamente"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addUserPhoto = async (req, res) => {
  const { id_usuario } = req.body;
  //const { foto_perfil } = req.files;
  try {
    //busca al usuario por el id
    const userFound = await user.findOneById(id_usuario);
    //si no encuentra al usurio da el mensaje de error
    if (!userFound)
      return res.status(404).json({ message: "Usuario no encontrado" });
    if (!req.files[0].buffer)
      return res.status(406).json({ message: "No se agrego foto de perfil" });
    //busca al usuario por el email
    const newPhoto = await user.saveProfilePhoto(
      id_usuario,
      req.files[0].buffer
    );

    res.status(200).json({ message: "Foto de perfil agregada" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const {
    nombre,
    apellido,
    telefono,
    empresa,
    cargo,
    departamento,
    cedula,
    id_usuario,
  } = req.body;
  try {
    //busca al usuario por el id
    const userFound = await user.findOneById(id_usuario);
    //si no encuentra al usurio da el mensaje de error
    if (!userFound)
      return res.status(404).json({ message: "Usuario no encontrado" });
    console.log(nombre);
    const newuser = new user(
      nombre !== null ? nombre : null,
      apellido !== null ? apellido : null,
      null,
      null,
      telefono !== null ? telefono : null,
      empresa !== null ? empresa : null,
      cargo !== null ? cargo : null,
      departamento !== null ? departamento : null,
      null,
      id_usuario !== null ? id_usuario : null,
      null,
      cedula !== null ? cedula : null
    );
    const userUpdate = await user.updateUser(newuser);

    res.status(200).json({
      message: "Usuario actualizado correctamente"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  //const { authToken } = req.cookies;

  const { password, new_password, id_usuario } = req.body;
  try {
    const userFound = await user.findOneById(id_usuario);

    if (!userFound) return res.status(401).json({ message: "Unauthorized" });

    //se decifra la contrase;a y se compara
    const isMatch = await bcrypt.compare(password, userFound.password);

    //si no son iguales da el mensaje de error
    if (!isMatch)
      return res.status(511).json({ message: "Contraseña actual erronea" });
    const passwordHash = await bcrypt.hash(new_password, 10);
    const userFound2 = await user.updatePassword(id_usuario, passwordHash);
    //console.log(passwordHash)
    res.cookie("authToken", "", {
      expires: new Date(0),
    });

    return res.status(200).json({message: "Contraseña actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePasswordToken = async (req, res) => {
  const { authToken } = req.cookies;

  const { email } = req.body;
  //if (!authToken) return res.status(401).json({ message: "Invalid token" });
  try {
    const userFound = await user.findOne(email);

    if (!userFound) return res.status(404).json({ message: "No se encontro email" });

    const token = v4().split("-")[0];

    const tokenSaved = await user.updateToken(token, userFound.id_usuario);

    await user.updateVerificar("sin verificar", userFound.id_usuario);
    await user.sendEmailToken(token, email, userFound.nombre);

    return res.status(200).json({
      message: "Token enviado al email exitosamente" 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  //const { authToken } = req.cookies;

  const { password, email, token } = req.body;
  try {
    const userFound = await user.findOne(email);
    
    if (!userFound) return res.status(401).json({ message: "No Autorizado" });

    if (userFound.token === token) {
      await user.updateVerificar("verificado", userFound.id_usuario);

      const passwordHash = await bcrypt.hash(password, 10);

      const userFound2 = await user.updatePassword(
        userFound.id_usuario,
        passwordHash
      );

    } else {

      return res.status(401).json({ message: "Token no coincide" });

    }

    res.cookie("authToken", "", {
      expires: new Date(0),
    });

    return res.status(200).json({
      message: "Contraseña actualizada correctamente" 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
