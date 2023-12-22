'use strict';

const sequelize = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documento_geral_alerta', {
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
      mensagem: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      tipo: {
        type: sequelize.DataTypes.ENUM([
          'F', // Documentos Faltantes
          'P', // Pendente Entrega
        ]),
        allowNull: false
      },
      prioridade: {
        type: sequelize.DataTypes.ENUM([
          'INFO',
          'WARN',
          'ERRO'
        ]),
        allowNull: false
      },
      prioridade_ordem: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      documento_geral_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'documento_geral',
          key: 'id'
        }
      },
      substituicao_alerta_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'documento_geral_alerta',
          key: 'id'
        }
      },
      resolucao: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('documento_geral_alerta');
  }
};