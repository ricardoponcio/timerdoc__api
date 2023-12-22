'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('usuario_empresa', 'usuario_empresa_pkey');
    await queryInterface.addConstraint('usuario_empresa', {
      fields: ['id'],
      type: 'primary key'
    });
  },

  async down(queryInterface, Sequelize) {

  }
};
