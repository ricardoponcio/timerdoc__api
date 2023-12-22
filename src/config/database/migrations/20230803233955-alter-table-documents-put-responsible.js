'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('documento_geral', 'responsavel_id',
      {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario',
          key: 'id'
        }
      },
    );
    await queryInterface.addColumn('documento_recorrente', 'responsavel_id',
      {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario',
          key: 'id'
        }
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('documento_geral', 'responsavel_id');
    await queryInterface.removeColumn('documento_recorrente', 'responsavel_id');
  },
};
