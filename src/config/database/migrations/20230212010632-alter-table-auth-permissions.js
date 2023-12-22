'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('usuario', 'empresa_id');
    await queryInterface.removeColumn('usuario', 'role_id');
    await queryInterface.addColumn('usuario_empresa', 'id',
      {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      }
    );
    await queryInterface.addColumn('usuario_empresa', 'role_id',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'role',
          key: 'id'
        }
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('usuario_empresa', 'id');
    await queryInterface.removeColumn('usuario_empresa', 'role_id');
  }
};
