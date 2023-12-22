'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('usuario_hash_recuperacao', 'status', {
      type: Sequelize.DataTypes.ENUM([
        'ABERTO',
        'UTILIZADO',
        'CANCELADO',
        'EXPIRADO',
        'SUBSTITUIDO',
      ]),
      allowNull: false,
      defaultValue: 'UTILIZADO',
    });
    await queryInterface.sequelize.query(
      'alter table usuario_hash_recuperacao alter column status drop DEFAULT',
    );
    await queryInterface.addColumn(
      'usuario_hash_recuperacao',
      'substituido_por_id',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario_hash_recuperacao',
          key: 'id',
        },
      },
    );
    await queryInterface.addColumn('usuario_hash_recuperacao', 'expira_em', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.removeColumn('usuario_hash_recuperacao', 'utilizado');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('usuario_hash_recuperacao', 'utilizado', {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    await queryInterface.removeColumn('usuario_hash_recuperacao', 'status');
    await queryInterface.removeColumn(
      'usuario_hash_recuperacao',
      'substituido_por_id',
    );
    await queryInterface.removeColumn('usuario_hash_recuperacao', 'expira_em');
  },
};
