'use strict';

const sequelize = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documento_recorrente_anexo', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('NOW')
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      filename: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      reference: {
        type: Sequelize.TEXT,
        allowNull: false
      },

      // Relacionamentos
      documento_recorrente_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'documento_recorrente',
          key: 'id'
        }
      }
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('documento_recorrente_anexo');
  }
};
