import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../db/sequelize';
import { MachineEntity } from "../../../domain/machine/machine.entity";
import { SequelizeCompany } from '../company/company.model';

export class SequelizeMachine extends Model<MachineEntity, Partial<MachineEntity>> implements MachineEntity {
  declare cmp_uuid: string;
  declare mch_uuid: string;
  declare mch_name: string;
  declare mch_description: string | null;
  declare mch_dailycapacity: number | null;
  declare mch_active: boolean;
  declare mch_createdat: Date;
  declare mch_updatedat: Date;
}

SequelizeMachine.init({
  cmp_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  mch_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  mch_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  mch_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  mch_dailycapacity: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  mch_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  mch_createdat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  mch_updatedat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  sequelize,
  timestamps: true,
  createdAt: 'mch_createdat',
  updatedAt: 'mch_updatedat',
  tableName: 'mch_machines'
});

SequelizeMachine.belongsTo(SequelizeCompany, {
  foreignKey: 'cmp_uuid',
  targetKey: 'cmp_uuid',
  as: 'company'
});

if (process.env.NODE_ENV !== "production") {
  SequelizeMachine.sync();
}
