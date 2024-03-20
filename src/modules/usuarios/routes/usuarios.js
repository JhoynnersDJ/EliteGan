import { Router } from "express";
import {
  login,
  logout,
  register,
  profile,
  updateRol,
  verifyToken,
  updateEmailToken,
  updateEmail,
  getByRol,
  suspendUser,
  addUserPhoto,
  updateUser,
} from "../controllers/UserControllers.js";
import { authRequired, authRequired2} from "../../../middlewares/validateToken.js";
import { rolRequired } from "../../../middlewares/validateRol.js";
import { validateSchema } from "../../../middlewares/ValidatorSchema.js";
import {
  loginSchema,
  registerSchema,
  updateRolfromAdmin,
} from "../schemas/UserSchema.js";

const router = Router();
//registrar usuario (nombre de usuario, contraseña, email)
router.post("/crear", validateSchema(registerSchema), register);

//iniciar sesion con email y contraseña
router.post("/login", validateSchema(loginSchema), login);

//finalizar sesion usuario
router.post("/logout", authRequired, logout);

//obtener datos del usuario
router.get("/perfil", authRequired, profile);

//actualizar rol del usuario
router.post(
  "/actualizar-rol",
  authRequired,
  rolRequired("admin", "moderador", null),
  validateSchema(updateRolfromAdmin),
  updateRol
);

//verificar el authToken
router.get("/verificar", verifyToken);

//enviar token por email, verificado = false
router.post("/actualizar-email", authRequired2, updateEmailToken);

//cambiar email por el nuevo, verificado = true
router.post("/verificar-email", authRequired2, updateEmail);

router.get("/todos-tecnicos", getByRol);

router.post("/suspender_usuario/:id", authRequired2,suspendUser);
import multer from 'multer';
const upload = multer();
router.post("/foto_usuario", authRequired2,upload.array('foto_perfil'),addUserPhoto);

router.put("/actualizar", authRequired2,updateUser);

export default router;
