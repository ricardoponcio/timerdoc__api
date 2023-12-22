'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('documento_geral', 'ativo',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('documento_geral', 'ativo')
  }
};
