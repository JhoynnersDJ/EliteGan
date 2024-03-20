import userFunction from "./UsersFunction.js";

//clase que define la estructura del usuario del sistema
export class user {
  constructor(
    nombre,
    apellido,
    email,
    password,
    telefono,
    empresa,
    cargo,
    departamento,
    rol,
    id_usuario,
    id_estado_usuario,
    cedula,
    token
  ) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.password = password;
    this.telefono = telefono;
    this.empresa = empresa;
    this.cargo = cargo;
    this.departamento = departamento;
    this.rol = rol;
    this.id_usuario = id_usuario;
    this.id_estado_usuario = id_estado_usuario;
    this.cedula = cedula;
    this.token = token;
  }

  //gets de los atributos de user
  getUserName() {
    return this.nombre;
  }
  getUserLastName() {
    return this.apellido;
  }
  getUserEmail() {
    return this.email;
  }
  getUserPassword() {
    return this.password;
  }
  getUserId() {
    return this.id_usuario;
  }
  getUserCellphone() {
    return this.telefono;
  }
  getUserEmpress() {
    return this.empresa;
  }
  getUserDepartament() {
    return this.departamento;
  }
  getUserRol() {
    return this.rol.id_rol;
  }

  //sets de los atributos de user
  setname(name) {
    this.name = name;
  }
  setUserEmail(email) {
    this.email = email;
  }
  setUserPassword(password) {
    this.password = password;
  }
  setUserId(id) {
    this.id = id;
  }
  setUserRol(rol) {
    this.rol = rol;
  }

  static save(user) {
    return userFunction.save(user);
  }

  static findOne(email) {
    return userFunction.findOne(email);
  }

  static verificado(email) {
    return userFunction.verificado(email);
  }

  static findOneById(id) {
    return userFunction.findOneById(id);
  }

  static updateRol(rol, email) {
    return userFunction.updateRol(rol, email);
  }

  static updateToken(token, id) {
    return userFunction.updateToken(token, id);
  }

  static sendEmailToken(token, email, nombre) {
    return userFunction.sendEmailToken(token, email, nombre);
  }

  static updateEmail(email, id) {
    return userFunction.updateEmail(email, id);
  }

  static updateVerificar(ver, id) {
    return userFunction.updateVerificar(ver, id);
  }
  static getByRol() {
    return userFunction.getByRol();
  }
  static updateState(state, id) {
    return userFunction.updateState(state, id);
  }
  static saveProfilePhoto(id_usuario, file) {
    return userFunction.saveProfilePhoto(id_usuario, file);
  }
}

export class userRol {
  constructor(id_rol, nombre_rol, descripcion_rol) {
    (this.id_rol = id_rol),
      (this.nombre_rol = nombre_rol),
      (this.descripcion_rol = descripcion_rol);
  }
  getUseRol() {
    return this.nombre_rol;
  }
}
