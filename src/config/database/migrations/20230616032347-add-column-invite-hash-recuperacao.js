'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'usuario_hash_recuperacao',
      'usuario_empresa_convite_id',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario_empresa_convite',
          key: 'id',
        },
      },
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
