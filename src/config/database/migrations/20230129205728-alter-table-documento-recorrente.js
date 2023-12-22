'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'documento_recorrente', 'ativo',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    );
    await queryInterface.addColumn(
      'documento_recorrente', 'usuario_ultima_alteracao_id',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'usuario',
          key: 'id'
        }
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('documento_recorrente', 'ativo');
    await queryInterface.removeColumn('documento_recorrente', 'usuario_ultima_alteracao_id');
  }
};
