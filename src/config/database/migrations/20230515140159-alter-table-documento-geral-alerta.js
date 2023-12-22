'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('documento_geral_alerta', 'descricao',
      {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('documento_geral_alerta', 'descricao')
  }
};
