'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('documento_geral', 'deletedAt',
      {
        type: Sequelize.DATE,
        allowNull: true
      },
    );
    await queryInterface.addColumn('documento_recorrente', 'deletedAt',
      {
        type: Sequelize.DATE,
        allowNull: true
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('documento_geral', 'deletedAt');
    await queryInterface.removeColumn('documento_recorrente', 'deletedAt');
  }
};
