import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../db/sequelize';
import { OrderEntity, OrderStatus } from "../../../domain/order/order.entity";
import { SequelizeCompany } from '../company/company.model';
import { SequelizeCustomer } from '../customer/customer.model';
import { SequelizeUser } from '../user/user.model';
import { SequelizeOrderDetail } from './order-detail.model';

export class SequelizeOrder extends Model<OrderEntity, Partial<OrderEntity>> implements OrderEntity {
  declare cmp_uuid: string;
  declare ord_uuid: string;
  declare cus_uuid: string;
  declare usr_uuid_seller: string;
  declare usr_uuid_driver: string | null;
  declare ord_orderdate: Date;
  declare ord_deliverydate: Date | null;
  declare ord_status: OrderStatus;
  declare ord_totalamount: number;
  declare ord_notes: string | null;
  declare ord_createdat: Date;
  declare ord_updatedat: Date;
}

SequelizeOrder.init({
  cmp_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  ord_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  cus_uuid: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  usr_uuid_seller: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  usr_uuid_driver: {
    type: DataTypes.STRING(40),
    allowNull: true
  },
  ord_orderdate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  ord_deliverydate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ord_status: {
    type: DataTypes.STRING(30),
    defaultValue: 'PENDIENTE_DE_ENTREGA',
    allowNull: false
  },
  ord_totalamount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    allowNull: false
  },
  ord_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ord_createdat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  ord_updatedat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  sequelize,
  timestamps: true,
  createdAt: 'ord_createdat',
  updatedAt: 'ord_updatedat',
  tableName: 'ord_orders',
  indexes: [
    {
      name: 'idx_ord_status_date',
      fields: ['cmp_uuid', 'ord_status', 'ord_orderdate']
    },
    {
      name: 'idx_ord_customer',
      fields: ['cmp_uuid', 'cus_uuid']
    }
  ]
});

SequelizeOrder.belongsTo(SequelizeCompany, {
  foreignKey: 'cmp_uuid',
  targetKey: 'cmp_uuid',
  as: 'company'
});

SequelizeOrder.belongsTo(SequelizeCustomer, {
  foreignKey: 'cus_uuid',
  targetKey: 'cus_uuid',
  as: 'customer'
});

SequelizeOrder.belongsTo(SequelizeUser, {
  foreignKey: 'usr_uuid_seller',
  targetKey: 'usr_uuid',
  as: 'seller'
});

SequelizeOrder.belongsTo(SequelizeUser, {
  foreignKey: 'usr_uuid_driver',
  targetKey: 'usr_uuid',
  as: 'driver'
});

SequelizeOrder.hasMany(SequelizeOrderDetail, {
  foreignKey: 'ord_uuid',
  sourceKey: 'ord_uuid',
  as: 'details'
});

SequelizeOrderDetail.belongsTo(SequelizeOrder, {
  foreignKey: 'ord_uuid',
  targetKey: 'ord_uuid',
  as: 'order'
});

if (process.env.NODE_ENV !== "production") {
  SequelizeOrder.sync();
}
