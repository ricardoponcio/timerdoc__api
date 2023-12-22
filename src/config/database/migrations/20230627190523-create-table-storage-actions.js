'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('armazenamento_acao',
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true,
        },
        data: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        tipo: {
          type: Sequelize.DataTypes.ENUM([
            'OCORRENCIA_ANEXO'
          ]),
          allowNull: false
        },
        acao: {
          type: Sequelize.DataTypes.ENUM([
            'CREATE',
            'DELETE',
            'DOWNLOAD'
          ]),
          allowNull: false
        },
        bucket: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        caminho_s3: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        tamanho_kb: {
          type: Sequelize.BIGINT(11),
          allowNull: false,
        },

        // Relacionamentos
        usuario_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'usuario',
            key: 'id'
          }
        },
        empresa_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'empresa',
            key: 'id'
          }
        }
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('armazenamento_acao');
  },
};
