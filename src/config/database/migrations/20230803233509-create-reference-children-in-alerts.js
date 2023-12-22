'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documento_geral_alerta_competencia', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      referente_a: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      
      // Relacionamentos
      documento_geral_alerta_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'documento_geral_alerta',
          key: 'id',
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('variavel');
  },
};
