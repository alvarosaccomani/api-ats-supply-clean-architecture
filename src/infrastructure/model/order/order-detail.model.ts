import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../db/sequelize';
import { OrderDetailEntity } from "../../../domain/order/order-detail.entity";
import { SequelizeProduct } from '../product/product.model';

export class SequelizeOrderDetail extends Model<OrderDetailEntity, Partial<OrderDetailEntity>> implements OrderDetailEntity {
  declare cmp_uuid: string;
  declare ord_uuid: string;
  declare ordd_uuid: string;
  declare prd_uuid: string;
  declare ordd_quantity: number;
  declare ordd_unitprice: number;
  declare ordd_subtotal: number;
  declare ordd_createdat: Date;
  declare ordd_updatedat: Date;
}

SequelizeOrderDetail.init({
  cmp_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  ordd_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  ord_uuid: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  prd_uuid: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  ordd_quantity: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  ordd_unitprice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  ordd_subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  ordd_createdat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  ordd_updatedat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  sequelize,
  timestamps: true,
  createdAt: 'ordd_createdat',
  updatedAt: 'ordd_updatedat',
  tableName: 'ordd_orderdetails'
});

SequelizeOrderDetail.belongsTo(SequelizeProduct, {
  foreignKey: 'prd_uuid',
  targetKey: 'prd_uuid',
  as: 'product'
});

if (process.env.NODE_ENV !== "production") {
  SequelizeOrderDetail.sync();
}
