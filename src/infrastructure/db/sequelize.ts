import { Sequelize } from "sequelize";
import { development } from "./config";
import pg from 'pg';

// Forzar al driver pg a interpretar TIMESTAMP WITHOUT TIME ZONE (OID 1114) como UTC puro
pg.types.setTypeParser(1114, (stringValue: string) => {
  return new Date(stringValue + 'Z');
});

export const sequelize = new Sequelize(development);

