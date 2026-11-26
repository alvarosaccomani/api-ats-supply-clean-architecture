import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../db/sequelize';
import { OrderHistoryEntity } from "../../../domain/order-history/order-history.entity";
import { SequelizeUser } from '../user/user.model';
import { SequelizeCompany } from '../company/company.model';
import { SequelizeOrder } from '../order/order.model';

export class SequelizeOrderHistory extends Model<OrderHistoryEntity, Partial<OrderHistoryEntity>> implements OrderHistoryEntity {
  declare cmp_uuid: string;
  declare ordh_uuid: string;
  declare ord_uuid: string;
  declare usr_uuid: string;
  declare ordh_previousstatus: string | null;
  declare ordh_newstatus: string;
  declare ordh_notes: string | null;
  declare ordh_createdat: Date;
  declare ordh_updatedat: Date;
}

SequelizeOrderHistory.init({
  cmp_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  ordh_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  ord_uuid: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  usr_uuid: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  ordh_previousstatus: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  ordh_newstatus: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  ordh_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ordh_createdat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  ordh_updatedat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  sequelize,
  timestamps: true,
  createdAt: 'ordh_createdat',
  updatedAt: 'ordh_updatedat',
  tableName: 'ordh_orderhistory',
  indexes: [
    {
      name: 'idx_ordh_timeline',
      fields: ['cmp_uuid', 'ord_uuid', 'ordh_createdat']
    }
  ]
});

SequelizeOrderHistory.belongsTo(SequelizeCompany, {
  foreignKey: 'cmp_uuid',
  targetKey: 'cmp_uuid',
  as: 'company'
});

SequelizeOrderHistory.belongsTo(SequelizeUser, {
  foreignKey: 'usr_uuid',
  targetKey: 'usr_uuid',
  as: 'user'
});

SequelizeOrderHistory.belongsTo(SequelizeOrder, {
  foreignKey: 'ord_uuid',
  targetKey: 'ord_uuid',
  as: 'order'
});
