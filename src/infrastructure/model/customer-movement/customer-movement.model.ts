import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../db/sequelize';
import { CustomerMovementEntity, CustomerMovementType } from "../../../domain/customer-movement/customer-movement.entity";
import { SequelizeCustomer } from '../customer/customer.model';
import { SequelizeUser } from '../user/user.model';
import { SequelizeCompany } from '../company/company.model';
import { SequelizeOrder } from '../order/order.model';

export class SequelizeCustomerMovement extends Model<CustomerMovementEntity, Partial<CustomerMovementEntity>> implements CustomerMovementEntity {
  declare cmp_uuid: string;
  declare cusm_uuid: string;
  declare cus_uuid: string;
  declare usr_uuid: string;
  declare cusm_type: CustomerMovementType;
  declare cusm_amount: number;
  declare cusm_previousbalance: number;
  declare cusm_newbalance: number;
  declare ord_uuid: string | null;
  declare cusm_paymentmethod: string | null;
  declare cusm_receiptnumber: string | null;
  declare cusm_notes: string | null;
  declare cusm_createdat: Date;
  declare cusm_updatedat: Date;
}

SequelizeCustomerMovement.init({
  cmp_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  cusm_uuid: {
    type: DataTypes.STRING(40),
    primaryKey: true,
    allowNull: false
  },
  cus_uuid: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  usr_uuid: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  cusm_type: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  cusm_amount: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false
  },
  cusm_previousbalance: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false
  },
  cusm_newbalance: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false
  },
  ord_uuid: {
    type: DataTypes.STRING(40),
    allowNull: true
  },
  cusm_paymentmethod: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  cusm_receiptnumber: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  cusm_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cusm_createdat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  cusm_updatedat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  sequelize,
  timestamps: true,
  createdAt: 'cusm_createdat',
  updatedAt: 'cusm_updatedat',
  tableName: 'cusm_customermovements',
  indexes: [
    {
      name: 'idx_cusm_customer_date',
      fields: ['cmp_uuid', 'cus_uuid', { name: 'cusm_createdat', order: 'DESC' }]
    }
  ]
});

SequelizeCustomerMovement.belongsTo(SequelizeCompany, {
  foreignKey: 'cmp_uuid',
  targetKey: 'cmp_uuid',
  as: 'company'
});

SequelizeCustomerMovement.belongsTo(SequelizeCustomer, {
  foreignKey: 'cus_uuid',
  targetKey: 'cus_uuid',
  as: 'customer'
});

SequelizeCustomerMovement.belongsTo(SequelizeUser, {
  foreignKey: 'usr_uuid',
  targetKey: 'usr_uuid',
  as: 'user'
});

SequelizeCustomerMovement.belongsTo(SequelizeOrder, {
  foreignKey: 'ord_uuid',
  targetKey: 'ord_uuid',
  as: 'order'
});

if (process.env.NODE_ENV !== "production") {
  SequelizeCustomerMovement.sync();
}
