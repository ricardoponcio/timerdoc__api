import { Sequelize } from 'sequelize-typescript';
/**
 * Não mais utilizado, após adotar o .env
 * 
 * @autor vitor.palhano
 * @date 2022-11-21
 * 
 */
export const databaseSequelizeProvider = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'username',
        password: 'password',
        database: 'database'
      });
      sequelize.addModels([
        // Plano,
        // Empresa
      ]);
      await sequelize.sync();
      return sequelize;
    },
  },
];