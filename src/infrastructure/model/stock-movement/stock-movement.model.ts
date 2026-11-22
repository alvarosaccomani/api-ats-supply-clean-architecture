import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../db/sequelize';
import { StockMovementEntity, StockMovementType } from "../../../domain/stock-movement/stock-movement.entity";
import { SequelizeProduct } from '../product/product.model';
import { SequelizeUser } from '../user/user.model';
import { SequelizeCompany } from '../company/company.model';

export class SequelizeStockMovement extends Model<StockMovementEntity, Partial<StockMovementEntity>> implements StockMovementEntity {
  declare cmp_uuid: string;
  declare stkm_uuid: string;
  declare prd_uuid: string;
  declare usr_uuid: string;
  declare stkm_type: StockMovementType;
  declare stkm_quantity: number;
  declare stkm_previousstock: number;
  declare stkm_newstock: number;
  declare stkm_referenceuuid: string | null;
  declare stkm_notes: string | null;
  declare stkm_createdat: Date;
  declare stkm_updatedat: Date;
}

SequelizeStockMovement.init({
  cmp_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  stkm_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  prd_uuid: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  usr_uuid: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  stkm_type: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  stkm_quantity: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  stkm_previousstock: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  stkm_newstock: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  stkm_referenceuuid: {
    type: DataTypes.STRING(40),
    allowNull: true
  },
  stkm_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  stkm_createdat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  stkm_updatedat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  sequelize,
  timestamps: true,
  createdAt: 'stkm_createdat',
  updatedAt: 'stkm_updatedat',
  tableName: 'stkm_stockmovements',
  indexes: [
    {
      name: 'idx_stkm_product_date',
      fields: ['cmp_uuid', 'prd_uuid', { name: 'stkm_createdat', order: 'DESC' }]
    }
  ]
});

SequelizeStockMovement.belongsTo(SequelizeCompany, {
  foreignKey: 'cmp_uuid',
  targetKey: 'cmp_uuid',
  as: 'company'
});

SequelizeStockMovement.belongsTo(SequelizeProduct, {
  foreignKey: 'prd_uuid',
  targetKey: 'prd_uuid',
  as: 'product'
});

SequelizeStockMovement.belongsTo(SequelizeUser, {
  foreignKey: 'usr_uuid',
  targetKey: 'usr_uuid',
  as: 'user'
});

if (process.env.NODE_ENV !== "production") {
  SequelizeStockMovement.sync();
}
