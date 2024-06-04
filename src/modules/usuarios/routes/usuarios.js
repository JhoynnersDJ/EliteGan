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
  updatePassword,
  updatePasswordToken,
  forgotPassword,
  getAllUser
} from "../controllers/UserControllers.js";
import { authRequired, authRequired2} from "../../../middlewares/validateToken.js";
import { rolRequired } from "../../../middlewares/validateRol.js";
import { validateSchema } from "../../../middlewares/ValidatorSchema.js";
import {
  loginSchema,
  registerSchema,
  updateRolfromAdmin,
  updatePasswordSchema,
  forgotUpdatePasswordSchema,
  updateEmailSchema,
  updateEmailTokenSchema,
  forgotUpdatePasswordTokenSchema
} from "../schemas/UserSchema.js";


const router = Router();
//registrar usuario (nombre de usuario, contraseña, email)
router.post("/crear", validateSchema(registerSchema), register);

//iniciar sesion con email y contraseña
router.post("/login", validateSchema(loginSchema), login);

//finalizar sesion usuario
router.post("/logout", authRequired, logout);

//obtener datos del usuario
router.get("/perfil/:id_usuario",authRequired, profile);

//actualizar rol del usuario
router.post(
  "/actualizar-rol",
  authRequired,
  rolRequired("admin", "moderador", null),
  validateSchema(updateRolfromAdmin),
  updateRol
);

//verificar el authToken
router.get("/verificar",authRequired, verifyToken);

//enviar token por email, verificado = false
router.post("/actualizar-email", authRequired,validateSchema(updateEmailTokenSchema),updateEmailToken);

//cambiar email por el nuevo, verificado = true
router.post("/verificar-email",authRequired,validateSchema(updateEmailSchema), updateEmail);

router.get("/todos-tecnicos",authRequired, getByRol);

router.post("/suspender_usuario/:id",authRequired, authRequired2,suspendUser);

import { getStorage } from "firebase/storage";
// Initialize Cloud Storage and get a reference to the service
const storage = getStorage();
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });
router.post("/foto-perfil",upload.array('foto_perfil'),addUserPhoto);

router.put("/actualizar",authRequired,updateUser);

router.put("/actualizar-password",authRequired,validateSchema(updatePasswordSchema),updatePassword);

//enviar token por email, verificado = false
router.post("/actualizar-password",validateSchema(forgotUpdatePasswordTokenSchema), updatePasswordToken);

//cambiar email por el nuevo, verificado = true
router.put("/verificar-password",validateSchema(forgotUpdatePasswordSchema), forgotPassword);

router.get("/todos-usuarios",authRequired, getAllUser);

export default router;
