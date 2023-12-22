'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('usuario_empresa', 'createdAt',
      {
        type: Sequelize.DATE,
        allowNull: true
      },
    );
    await queryInterface.addColumn('usuario_empresa', 'updatedAt',
      {
        type: Sequelize.DATE,
        allowNull: true
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('usuario_empresa', 'createdAt');
    await queryInterface.removeColumn('usuario_empresa', 'updatedAt');
  }
};
