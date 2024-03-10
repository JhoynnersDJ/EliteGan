import { DataTypes } from 'sequelize';
import { sequelizeClients } from '../sequelize.js'; 

const ResponsablesCliente = sequelizeClients.define('responsables_cliente', {
    id_responsable_cliente: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
    nombre_responsable_cliente: {
    type: DataTypes.STRING,
    allowNull: false,
    },
    cargo: {
    type: DataTypes.STRING,
    allowNull: false,
    },
    departamento: {
    type: DataTypes.STRING,
    allowNull: false,
    },
    telefono: {
    type: DataTypes.INTEGER,
    allowNull: false,
    },
    cedula: {
    type: DataTypes.INTEGER,
    allowNull: false,
    },
    id_cliente: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
    model: 'clientes', // Nombre de la tabla de referencia
    key: 'id_cliente', // Clave primaria en la tabla de referencia
    },
},

}, {
    timestamps: false, // Desactivar las columnas createdAt y updatedAt

});

export  { ResponsablesCliente };