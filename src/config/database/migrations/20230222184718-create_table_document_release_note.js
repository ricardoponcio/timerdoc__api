'use strict';

const sequelize = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documento_recorrente_observacao', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      dataHora: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('now')
      },
      observacao: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      usuario_id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'usuario',
          key: 'id'
        }
      },
      documento_recorrente_id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'documento_recorrente',
          key: 'id'
        }
      }
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('documento_recorrente_observacao');
  }
};
