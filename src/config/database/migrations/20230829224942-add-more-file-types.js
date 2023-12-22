'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('armazenamento_acao', 'tipo', {
      type: Sequelize.TEXT,
    });
    await queryInterface.sequelize
      .query('drop type enum_armazenamento_acao_tipo;')
      .then(() =>
        queryInterface.changeColumn('armazenamento_acao', 'tipo', {
          type: Sequelize.ENUM('OCORRENCIA_ANEXO', 'LOGO', 'IMAGEM_PERFIL'),
        }),
      );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('documento_geral_alerta', 'tipo', {
      type: Sequelize.TEXT,
    });
    await queryInterface.sequelize
      .query('drop type enum_armazenamento_acao_tipo;')
      .then(() =>
        queryInterface.changeColumn('armazenamento_acao', 'tipo', {
          type: Sequelize.ENUM('OCORRENCIA_ANEXO'),
        }),
      );
  },
};
