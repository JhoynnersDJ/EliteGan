import { user} from "../model/UserModel.js";
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
    num_tel,
    empresa,
    departamento,
    cargo,
  } = req.body;

  try {
    //se busca el correo para saber si ya esta registrado
    const userFound = await user.findOne(email);

    //si se encuentra el email se da el siguiente mensaje de error
    if (userFound) return res.status(202).json(["The email alredy exists"]);

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
      num_tel,
      empresa,
      cargo,
      departamento,
      null,
      idUnico
    );

    //se guarda el usuario
    const userSaved = await user.save(newuser);
      console.log(userSaved)
    //se genera el token para ser manejado por la cookie
    const authToken = await createAccessToken({
      id_us: newuser.getUserId(),
      rol: userSaved.id_rol,
    });

    //se envia de respuesta el token yy los datos ingresados
    res.cookie("authToken", authToken);

    res.status(200).json({
      id: newuser.getUserId(),
      nombre: newuser.getUserName(),
      apellido: newuser.getUserLastName(),
      email: newuser.getUserEmail(),
      password: newuser.getUserPassword(),
      num_tel: newuser.getUserCellphone(),
      empresa: newuser.getUserEmpress(),
      departamento: newuser.getUserDepartament(),
      rol: userSaved.id_rol,
      authToken: authToken,
    });
    console.log("Se creo el usuario correctamente");
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
      return res.status(202).json({ message: "Usuario no encontrado" });

    //si no se encuentra el email se da el siguiente mensaje de error
    if (!userFound.verificado)
      return res.status(202).json({ message: "Usuario no verificado" });

    //se decifra la contrase;a y se compara
    const isMatch = await bcrypt.compare(password, userFound.password);

    //si no son iguales da el mensaje de error
    if (!isMatch)
      return res.status(202).json({ message: "Incorrect password" });

    //se genera un token para ser manejado como una cookie
    const authToken = await createAccessToken({
      id_us: userFound.getUserId(),
      rol: userFound.getUserRol(),
    });

    //se envia de respuesta el token y los datos ingresados
    res.cookie("authToken", authToken);
    res.status(200).json({
      id: userFound.getUserId(),
      nombre: userFound.getUserName(),
      email: userFound.getUserEmail(),
      authToken: authToken,
    });
    console.log(`El usuario ${userFound.getUserName()} a iniciado sesion`);
    //userFound = null;
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//finalizar sesion del usuario
export const logout = (req, res) => {
  if (!req.cookies.authToken)
    return res.status(202).json({ message: "No has iniciado sesion" });
  //se le agota el tiempo de vida de la cookie
  res.cookie("authToken", "", {
    expires: new Date(0),
  });
  res.status(200).json({ message: "Se cerro sesion exitosamente" });
};

//obtener datos del usuario
export const profile = async (req, res) => {
  //busca al usuario por el id
  const userFound = await user.findOneById(req.user.id_us);

  //si no encuentra al usurio da el mensaje de error
  if (!userFound) return res.status(202).json({ message: "User not found" });

  //manda una respuesta con los datos del usuario encontrados
  res.status(200).json({
    id: userFound.getUserId(),
    nombre: userFound.getUserName(),
    apellido: userFound.getUserLastName(),
    email: userFound.getUserEmail(),
    password: userFound.getUserPassword(),
    num_tel: userFound.getUserCellphone(),
    empresa: userFound.getUserEmpress(),
    departamento: userFound.getUserDepartament(),
    rol: userFound.getUserRol(),
  });
  //userFound = null;
};

//actualizar rol del usuario cuyo email es ingresado en el body
export const updateRol = async (req, res) => {
  //busca al usuario por el id

  const userAdmin = await user.findOneById(req.user.id_us);

  //si no encuentra al usurio da el mensaje de error
  if (!userAdmin) return res.status(202).json({ message: "User not found" });

  const { email, rol } = req.body;

  try {
    //busca al usuario por el email
    const userFound = await user.findOne(email);

    //si no se encuentra el email se da el siguiente mensaje de error
    if (!userFound) return res.status(202).json({ message: "user not Found" });

    const newuser = await user.updateRol(rol, email);
    res.status(200).json({
      id: newuser.getUserId(),
      nombre: newuser.getUserName(),
      apellido: newuser.getUserLastName(),
      email: newuser.getUserEmail(),
      password: newuser.getUserPassword(),
      num_tel: newuser.getUserCellphone(),
      empress: newuser.getUserEmpress(),
      departamento: newuser.getUserDepartament(),
      rol: newuser.getUserRol(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//verificar el authToken
export const verifyToken = async (req, res) => {
  const { authToken } = req.cookies;

  if (!authToken) return res.status(401).json({ message: "Invalid token" });
  try {
    jwt.verify(authToken, TOKEN_SECRET, async (err, user2) => {
      if (err) return res.status(401).json({ message: "Invalid token" });

      const userFound = await user.findOneById(user2.id_us);

      if (!userFound) return res.status(401).json({ message: "Unauthorized" });

      return res.json({
        id_us: userFound.id_us,
        nombre: userFound.nombre,
        email: userFound.email,
        rol: userFound.getUserRol(),
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//enviar el token por correo, verificado = false
export const updateEmailToken = async (req, res) => {
  const { authToken } = req.cookies;

  const { email } = req.body;

  if (!authToken) return res.status(401).json({ message: "Invalid token" });
  try {
    jwt.verify(authToken, TOKEN_SECRET, async (err, user2) => {
      if (err) return res.status(401).json({ message: "Invalid token" });

      const userFound = await user.findOneById(user2.id_us);

      if (!userFound) return res.status(401).json({ message: "Unauthorized" });

      const token = v4().split("-")[0];

      const tokenSaved = await user.updateToken(token, userFound.id_us);

      await user.updateVerificar(false, userFound.id_us);

      await user.sendEmailToken(token, email, userFound.nombre);

      return res.json({
        id_us: userFound.id_us,
        nombre: userFound.nombre,
        email: userFound.email,
        rol: userFound.getUserRol(),
        token: token,
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//actualizar correo con el token, verificado = true
export const updateEmail = async (req, res) => {
  const { authToken } = req.cookies;

  const { token } = req.body;

  if (!authToken) return res.status(401).json({ message: "Invalid token" });
  try {
    jwt.verify(authToken, TOKEN_SECRET, async (err, user2) => {
      if (err) return res.status(401).json({ message: "Invalid token" });

      const userFound = await user.findOneById(user2.id_us);

      if (!userFound) return res.status(401).json({ message: "Unauthorized" });

      await user.updateVerificar(true, userFound.id_us);

      const userSaved = await user.updateEmail(userFound.id_us);

      res.cookie("authToken", "", {
        expires: new Date(0),
      });

      return res.json({
        id_us: userFound.id_us,
        nombre: userFound.nombre,
        email: userSaved.email,
        rol: userFound.getUserRol(),
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
