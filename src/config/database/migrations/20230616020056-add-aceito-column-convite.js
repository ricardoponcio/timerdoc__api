'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('usuario_empresa_convite', 'aceito', {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('usuario_empresa_convite', 'aceito');
  },
};
