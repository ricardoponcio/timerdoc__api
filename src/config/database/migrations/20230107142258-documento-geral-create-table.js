'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('documento_geral', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      // createdAt: {
      //   type: Sequelize.DATE,
      //   allowNull: false
      // },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      nome: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      descricao: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      ref_arquivo_geral: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      data_lancamento: { // equivalente a createAt
        type: Sequelize.DATE(6),// TODO: verificar se o now deu certo na criação da coluna
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      recorrencia: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 1
      },
      periodicidade: {
        type: DataTypes.ENUM([
          'DIA',
          'SEMANA',
          'MES',
          'TRIMESTRE',
          'SEMESTRE',
          'ANO'
        ]),
        allowNull: false
      },
      data_inicio_contagem: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      data_fim_contagem: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      valor_padrao: {// 9.999.999.999,999
        type: DataTypes.DECIMAL(13,3),
        allowNull: true
      },
      dias_aviso_vencimento: {
        type: Sequelize.SMALLINT,
        allowNull: true
      },
      // Relacionamentos
      usuario_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'usuario',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      empresa_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'empresa',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('documento_geral');
  }
};
