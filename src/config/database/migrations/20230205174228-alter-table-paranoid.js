'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('empresa', 'deletedAt',
      { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn('planos', 'deletedAt',
      { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn('usuario', 'deletedAt',
      { type: Sequelize.DATE, allowNull: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('empresa', 'deletedAt');
    await queryInterface.removeColumn('planos', 'deletedAt');
    await queryInterface.removeColumn('usuario', 'deletedAt');
  }
};
