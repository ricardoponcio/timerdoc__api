'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documento_geral_alerta_excecao', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.fn('NOW'),
      },

      competencia_referencia_excecao: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      // Relacionamentos
      documento_geral_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'documento_geral',
          key: 'id',
        },
      },
      documento_geral_alerta_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'documento_geral_alerta',
          key: 'id',
        },
      },
      usuario_criacao_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuario',
          key: 'id',
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('documento_geral_alerta_excecao');
  },
};
