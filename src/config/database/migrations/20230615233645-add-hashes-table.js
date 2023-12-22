'use strict';

const sequelize = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuario_hash_recuperacao', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      data_criacao: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('now'),
      },
      data_resolucao: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: sequelize.fn('now'),
      },
      hash_recuperacao: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      tipo: {
        type: sequelize.DataTypes.ENUM([
          'P', // Recover Password
          'R', // New Register
          'I', // Invite
        ]),
        allowNull: false,
      },
      utilizado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario',
          key: 'id',
        },
      },
    });
    await queryInterface.removeColumn('usuario', 'hash_recuperacao');
    await queryInterface.removeColumn('usuario_empresa_convite', 'hash_recuperacao');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuario_hash_recuperacao');
  },
};
