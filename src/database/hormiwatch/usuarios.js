// usuarios.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';

const Usuarios = sequelize.define('usuarios', {
id_usuario: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
cedula: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
apellido: {
    type: DataTypes.STRING,
    allowNull: false,
  },
email: {
    type: DataTypes.STRING,
    allowNull: false
  },
telefono: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
empresa: {
    type: DataTypes.STRING,
    allowNull: true,
  },
cargo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
departamento: {
    type: DataTypes.STRING,
    allowNull: true,
  },
token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
ultima_conexion: {
    type: DataTypes.DATE,
    allowNull: true,
  },
id_rol: {
    type: DataTypes.UUID, // Tipo de datos UUID para la clave externa del rol
    allowNull: false,
    references: {
      model: 'roles', // Nombre del modelo de la tabla a la que se hace referencia
      key: 'id_rol', // Clave primaria de la tabla a la que se hace referencia
    },
  },
id_estado_usuario: {
    type: DataTypes.UUID, // Tipo de datos UUID para la clave externa del rol
    allowNull: false,
    references: {
      model: 'estado_usuarios', // Nombre del modelo de la tabla a la que se hace referencia
      key: 'id_estado_usuario', // Clave primaria de la tabla a la que se hace referencia
    },
  }
}, {
  timestamps: false, // Desactivar las columnas createdAt y updatedAt
});

export { Usuarios } ;