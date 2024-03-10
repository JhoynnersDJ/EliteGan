import userFunction from'./UsersFunction.js';

//clase que define la estructura del usuario del sistema
export class user {
    constructor(nombre,apellido, email, password, num_tel, empresa,cargo, departamento, rol, id_us, verificado) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.password = password;
        this.num_tel = num_tel;
        this.empresa = empresa;
        this.cargo = cargo;
        this.departamento = departamento;
        this.rol = rol;
        this.id_us = id_us;
        this.verificado = verificado;
    }

    //gets de los atributos de user
    getUserName() { return this.nombre; }
    getUserLastName() { return this.apellido; }
    getUserEmail() { return this.email; }
    getUserPassword() { return this.password; }
    getUserId() { return this.id_us; }
    getUserCellphone() { return this.num_tel; }
    getUserEmpress() { return this.empresa; }
    getUserDepartament() { return this.departamento; }
    getUserRol() { return this.rol.nameRol; }

    //sets de los atributos de user
    setname(name) { this.name = name;}
    setUserEmail(email) { this.email = email;}
    setUserPassword(password) { this.password = password;}
    setUserId(id) { this.id = id;}
    setUserRol(rol) {this.rol = rol}


    static save(user){
        return userFunction.save(user);
    }

    static findOne(email){
        return userFunction.findOne(email);
    }

    static findOneById(id){
        return userFunction.findOneById(id);
    }

    static updateRol(rol, email){
        return userFunction.updateRol(rol, email);
    }

    static updateToken(token, id){
        return userFunction.updateToken(token, id);
    }

    static sendEmailToken(token,email,nombre) {
        return userFunction.sendEmailToken(token,email,nombre);
    }

    static updateEmail(email, id){
        return userFunction.updateEmail(email, id);
    }

    static updateVerificar(ver,id){
        return userFunction.updateVerificar(ver,id);
    }

}

export class userRol{
    constructor(id, nameRol, descriptionRol){
        this.id = id,
        this.nameRol = nameRol,
        this.descriptionRol = descriptionRol
    }
    getUseRol() {return this.nameRol;}
}

