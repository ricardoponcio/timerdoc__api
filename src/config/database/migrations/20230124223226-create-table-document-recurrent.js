'use strict';

const sequelize = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documento_recorrente', {
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
      deadline: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      situation: {
        type: sequelize.DataTypes.ENUM([
          'INICIADO',
          'BLOQUEADO',
          'ENTREGUE'
        ]),
        allowNull: false
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      // Relacionamentos
      documento_geral_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'documento_geral',
          key: 'id'
        }
      }
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('documento_recorrente');
  }
};
