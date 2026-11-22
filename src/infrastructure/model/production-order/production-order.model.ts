import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../db/sequelize';
import { ProductionOrderEntity, ProductionOrderStatus } from "../../../domain/production-order/production-order.entity";
import { SequelizeProduct } from '../product/product.model';
import { SequelizeMachine } from '../machine/machine.model';
import { SequelizeUser } from '../user/user.model';
import { SequelizeCompany } from '../company/company.model';

export class SequelizeProductionOrder extends Model<ProductionOrderEntity, Partial<ProductionOrderEntity>> implements ProductionOrderEntity {
  declare cmp_uuid: string;
  declare prdord_uuid: string;
  declare mch_uuid: string | null;
  declare prd_uuid: string;
  declare usr_uuid: string;
  declare prdord_producedqty: number;
  declare prdord_wasteqty: number;
  declare prdord_status: ProductionOrderStatus;
  declare prdord_productiondate: Date;
  declare prdord_notes: string | null;
  declare prdord_createdat: Date;
  declare prdord_updatedat: Date;
}

SequelizeProductionOrder.init({
  cmp_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  prdord_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  mch_uuid: {
    type: DataTypes.STRING(40),
    allowNull: true
  },
  prd_uuid: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  usr_uuid: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  prdord_producedqty: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  prdord_wasteqty: {
    type: DataTypes.FLOAT,
    defaultValue: 0.00,
    allowNull: false
  },
  prdord_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'COMPLETED',
    allowNull: false
  },
  prdord_productiondate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  prdord_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prdord_createdat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  prdord_updatedat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  sequelize,
  timestamps: true,
  createdAt: 'prdord_createdat',
  updatedAt: 'prdord_updatedat',
  tableName: 'prdord_productionorders',
  indexes: [
    {
      name: 'idx_prdord_date',
      fields: ['cmp_uuid', { name: 'prdord_productiondate', order: 'DESC' }]
    }
  ]
});

SequelizeProductionOrder.belongsTo(SequelizeCompany, {
  foreignKey: 'cmp_uuid',
  targetKey: 'cmp_uuid',
  as: 'company'
});

SequelizeProductionOrder.belongsTo(SequelizeProduct, {
  foreignKey: 'prd_uuid',
  targetKey: 'prd_uuid',
  as: 'product'
});

SequelizeProductionOrder.belongsTo(SequelizeMachine, {
  foreignKey: 'mch_uuid',
  targetKey: 'mch_uuid',
  as: 'machine'
});

SequelizeProductionOrder.belongsTo(SequelizeUser, {
  foreignKey: 'usr_uuid',
  targetKey: 'usr_uuid',
  as: 'user'
});

if (process.env.NODE_ENV !== "production") {
  SequelizeProductionOrder.sync();
}
