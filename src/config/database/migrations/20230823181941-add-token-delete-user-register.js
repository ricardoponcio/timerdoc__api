'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Delete
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_usuario_hash_recuperacao_tipo" ADD VALUE 'D';
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_usuario_hash_recuperacao_tipo" DROP VALUE 'D';
    `);
  },
};
