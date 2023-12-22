'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('usuario','telefone',{
      type: Sequelize.STRING(15),
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('usuario','telefone',{
      type: Sequelize.STRING(15),
      allowNull: false
    });
  }
};
