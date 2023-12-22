'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('documento_recorrente_anexo', 'ativo', {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    await queryInterface.renameColumn(
      'armazenamento_acao',
      'tamanho_kb',
      'tamanho',
    );
    await queryInterface.sequelize.query(
      'update armazenamento_acao set tamanho = (tamanho * 1024)',
    );
    await queryInterface.changeColumn('armazenamento_acao', 'tamanho', {
      type: Sequelize.DataTypes.BIGINT(20),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('documento_recorrente_anexo', 'ativo');
    await queryInterface.renameColumn(
      'armazenamento_acao',
      'tamanho',
      'tamanho_kb',
    );
    await queryInterface.sequelize.query(
      'update armazenamento_acao set tamanho_kb = (tamanho_kb / 1024)',
    );
  },
};
