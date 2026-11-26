import { OrderRepository } from "../../domain/order/order.repository";
import { OrderValue } from "../../domain/order/order.value";
import { OrderEntity, OrderCreateInput, OrderUpdateData, OrderStatus } from "../../domain/order/order.entity";
import { OrderDetailEntity } from "../../domain/order/order-detail.entity";
import { CustomerRepository } from "../../domain/customer/customer.repository";
import { ProductRepository } from "../../domain/product/product.repository";
import { CompanySettingRepository } from "../../domain/company-setting/company-setting.repository";
import { StockMovementUseCase } from "../stock-movement/stock-movement-use-case";
import { CustomerMovementUseCase } from "../customer-movement/customer-movement-use-case";
import { QueryOptions } from "../../domain/common";
import { TimezoneConverter } from "../../infrastructure/utils/TimezoneConverter";
import { sequelize } from "../../infrastructure/db/sequelize";

export class OrderUseCase {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly customerRepository: CustomerRepository,
        private readonly productRepository: ProductRepository,
        private readonly stockMovementUseCase: StockMovementUseCase,
        private readonly companySettingRepository?: CompanySettingRepository,
        private readonly customerMovementUseCase?: CustomerMovementUseCase
    ) {
        this.getOrders = this.getOrders.bind(this);
        this.getOrdersAndCount = this.getOrdersAndCount.bind(this);
        this.getDetailOrder = this.getDetailOrder.bind(this);
        this.createOrder = this.createOrder.bind(this);
        this.updateOrder = this.updateOrder.bind(this);
        this.deleteOrder = this.deleteOrder.bind(this);
    }

    private formatOrder(order: OrderEntity) {
        return {
            cmp_uuid: order.cmp_uuid,
            ord_uuid: order.ord_uuid,
            cus_uuid: order.cus_uuid,
            usr_uuid_seller: order.usr_uuid_seller,
            usr_uuid_driver: order.usr_uuid_driver ?? null,
            ord_orderdate: TimezoneConverter.toIsoStringInTimezone(order.ord_orderdate, 'America/Buenos_Aires'),
            ord_deliverydate: order.ord_deliverydate ? TimezoneConverter.toIsoStringInTimezone(order.ord_deliverydate, 'America/Buenos_Aires') : null,
            ord_status: order.ord_status,
            ord_totalamount: Number(order.ord_totalamount),
            ord_notes: order.ord_notes ?? null,
            ord_createdat: order.ord_createdat ? TimezoneConverter.toIsoStringInTimezone(order.ord_createdat, 'America/Buenos_Aires') : null,
            ord_updatedat: order.ord_updatedat ? TimezoneConverter.toIsoStringInTimezone(order.ord_updatedat, 'America/Buenos_Aires') : null,
            customer: order.customer ? {
                cus_uuid: order.customer.cus_uuid,
                cus_name: order.customer.cus_name,
                cus_address: order.customer.cus_address,
                cus_phone: order.customer.cus_phone ?? null,
                cus_lat: order.customer.cus_lat !== undefined && order.customer.cus_lat !== null ? Number(order.customer.cus_lat) : null,
                cus_lng: order.customer.cus_lng !== undefined && order.customer.cus_lng !== null ? Number(order.customer.cus_lng) : null,
                cus_hascredit: Boolean(order.customer.cus_hascredit),
                cus_currentbalance: Number(order.customer.cus_currentbalance) || 0,
                prct_uuid: order.customer.prct_uuid
            } : undefined,
            seller: order.seller ? {
                usr_uuid: order.seller.usr_uuid,
                usr_name: order.seller.usr_name,
                usr_surname: order.seller.usr_lastname || (order.seller as any).usr_surname,
                usr_email: order.seller.usr_email
            } : undefined,
            driver: order.driver ? {
                usr_uuid: order.driver.usr_uuid,
                usr_name: order.driver.usr_name,
                usr_surname: order.driver.usr_lastname || (order.driver as any).usr_surname,
                usr_email: order.driver.usr_email
            } : undefined,
            details: (order.details || []).map(d => ({
                cmp_uuid: d.cmp_uuid,
                ord_uuid: d.ord_uuid,
                ordd_uuid: d.ordd_uuid,
                prd_uuid: d.prd_uuid,
                ordd_quantity: Number(d.ordd_quantity),
                ordd_unitprice: Number(d.ordd_unitprice),
                ordd_subtotal: Number(d.ordd_subtotal),
                product: d.product ? {
                    prd_uuid: d.product.prd_uuid,
                    prd_code: d.product.prd_code,
                    prd_name: d.product.prd_name,
                    prd_unit: d.product.prd_unitlabel,
                    prd_stock: Number(d.product.prd_currentstock)
                } : undefined
            }))
        };
    }

    private async getStockDeductionMode(cmp_uuid: string, options?: QueryOptions): Promise<'ON_DELIVERY' | 'ON_TRUCK_LOAD'> {
        if (!this.companySettingRepository) {
            return 'ON_DELIVERY';
        }
        try {
            const setting = await this.companySettingRepository.findCompanySettingByKey(cmp_uuid, 'STOCK_DEDUCTION_MODE', null, options);
            if (setting && setting.cmps_value === 'ON_TRUCK_LOAD') {
                return 'ON_TRUCK_LOAD';
            }
            return 'ON_DELIVERY';
        } catch {
            return 'ON_DELIVERY';
        }
    }

    private isDeliveredStatus(status: OrderStatus): boolean {
        return ['ENTREGADO_DEBE', 'PAGADO', 'CUENTA_CORRIENTE'].includes(status);
    }

    public async getOrders(cmp_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid) {
                throw new Error("Debe proporcionar un identificador de empresa válido.");
            }
            const orders = await this.orderRepository.getOrders(cmp_uuid, options);
            if (!orders) {
                return [];
            }
            return orders.map(o => this.formatOrder(o));
        } catch (error: any) {
            console.error("Error en getOrders (use case):", error.message);
            throw error;
        }
    }

    public async getOrdersAndCount(cmp_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid) {
                throw new Error("Debe proporcionar un identificador de empresa válido.");
            }
            const result = await this.orderRepository.getOrdersAndCount(cmp_uuid, options);
            if (!result) {
                return { count: 0, rows: [] };
            }
            return {
                count: result.count,
                rows: result.rows.map(o => this.formatOrder(o))
            };
        } catch (error: any) {
            console.error("Error en getOrdersAndCount (use case):", error.message);
            throw error;
        }
    }

    public async getDetailOrder(cmp_uuid: string, ord_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !ord_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y ord_uuid válidos.");
            }
            const order = await this.orderRepository.findOrderById(cmp_uuid, ord_uuid, options);
            if (!order) {
                throw new Error(`No se encontró el pedido con ID: ${ord_uuid}`);
            }
            return this.formatOrder(order);
        } catch (error: any) {
            console.error("Error en getDetailOrder (use case):", error.message);
            throw error;
        }
    }

    public async createOrder(input: OrderCreateInput, options?: QueryOptions) {
        const transaction = options?.transaction || await sequelize.transaction();
        const shouldCommit = !options?.transaction;

        try {
            const { cmp_uuid, cus_uuid, usr_uuid_seller, details } = input;
            if (!cmp_uuid) {
                throw new Error("Debe proporcionar el identificador de la empresa (cmp_uuid).");
            }
            if (!cus_uuid) {
                throw new Error("Debe seleccionar un cliente para el pedido.");
            }
            if (!usr_uuid_seller) {
                throw new Error("Debe asignar el usuario preventista / vendedor.");
            }
            if (!details || details.length === 0) {
                throw new Error("El pedido debe contener al menos un producto.");
            }

            const customer = await this.customerRepository.findCustomerById(cmp_uuid, cus_uuid, { transaction });
            if (!customer) {
                throw new Error(`El cliente con ID ${cus_uuid} no existe en la empresa.`);
            }

            const resolvedDetails: OrderDetailEntity[] = [];

            for (const item of details) {
                const product = await this.productRepository.findProductById(cmp_uuid, item.prd_uuid, { transaction });
                if (!product) {
                    throw new Error(`El producto con ID ${item.prd_uuid} no existe.`);
                }
                if (!product.prd_active) {
                    throw new Error(`El producto '${product.prd_name}' está inactivo y no se puede vender.`);
                }
                if (product.prd_type === 'SUPPLY') {
                    throw new Error(`El artículo '${product.prd_name}' es un insumo / materia prima y no puede ser vendido en un pedido.`);
                }

                let unitPrice = Number(item.ordd_unitprice);
                if (isNaN(unitPrice) || unitPrice <= 0) {
                    const prices = await this.productRepository.getProductPrices(cmp_uuid, item.prd_uuid, { transaction });
                    const tierPrice = (prices || []).find(p => p.prct_uuid === customer.prct_uuid);
                    if (tierPrice && Number(tierPrice.prdprc_price) > 0) {
                        unitPrice = Number(tierPrice.prdprc_price);
                    } else {
                        unitPrice = 0;
                    }
                }

                const quantity = Number(item.ordd_quantity);
                if (isNaN(quantity) || quantity <= 0) {
                    throw new Error(`La cantidad del producto '${product.prd_name}' debe ser mayor a 0.`);
                }

                resolvedDetails.push({
                    cmp_uuid,
                    ord_uuid: '',
                    ordd_uuid: '',
                    prd_uuid: item.prd_uuid,
                    ordd_quantity: quantity,
                    ordd_unitprice: unitPrice,
                    ordd_subtotal: quantity * unitPrice
                });
            }

            const orderValue = new OrderValue({
                ...input,
                detailsWithPrices: resolvedDetails
            });

            const createdOrder = await this.orderRepository.createOrder(orderValue, { transaction });
            if (!createdOrder) {
                throw new Error("No se pudo registrar la cabecera y detalle del pedido.");
            }

            // Si el pedido se da de alta en estado de entrega directa, evaluar modo de stock
            const deductionMode = await this.getStockDeductionMode(cmp_uuid, { transaction });
            if (this.isDeliveredStatus(createdOrder.ord_status) && deductionMode === 'ON_DELIVERY') {
                for (const detail of (createdOrder.details || [])) {
                    await this.stockMovementUseCase.registerMovement({
                        cmp_uuid,
                        prd_uuid: detail.prd_uuid,
                        usr_uuid: usr_uuid_seller,
                        stkm_type: 'ORDER_OUT',
                        stkm_quantity: -Math.abs(Number(detail.ordd_quantity)),
                        stkm_referenceuuid: createdOrder.ord_uuid,
                        stkm_notes: `Salida por entrega de pedido #${createdOrder.ord_uuid}`
                    }, { transaction });
                }
            }

            // Si el pedido nace en CUENTA_CORRIENTE, asentar débito en cuenta corriente
            if (createdOrder.ord_status === 'CUENTA_CORRIENTE' && this.customerMovementUseCase) {
                await this.customerMovementUseCase.registerMovement({
                    cmp_uuid,
                    cus_uuid: createdOrder.cus_uuid,
                    usr_uuid: usr_uuid_seller,
                    cusm_type: 'ORDER_DEBIT',
                    cusm_amount: Number(createdOrder.ord_totalamount),
                    ord_uuid: createdOrder.ord_uuid,
                    cusm_notes: `Débito en Cta. Cte. por alta de pedido #${createdOrder.ord_uuid}`
                }, { transaction });
            }

            if (shouldCommit) {
                await transaction.commit();
            }

            const finalOrder = await this.orderRepository.findOrderById(cmp_uuid, createdOrder.ord_uuid);
            return this.formatOrder(finalOrder || createdOrder);
        } catch (error: any) {
            if (shouldCommit) {
                await transaction.rollback();
            }
            console.error("Error en createOrder (use case):", error.message);
            throw error;
        }
    }

    public async updateOrder(cmp_uuid: string, ord_uuid: string, data: OrderUpdateData, options?: QueryOptions) {
        const transaction = options?.transaction || await sequelize.transaction();
        const shouldCommit = !options?.transaction;

        try {
            if (!cmp_uuid || !ord_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y ord_uuid válidos.");
            }

            const currentOrder = await this.orderRepository.findOrderById(cmp_uuid, ord_uuid, { transaction });
            if (!currentOrder) {
                throw new Error(`No existe el pedido con ID: ${ord_uuid}`);
            }

            const currentStatus = currentOrder.ord_status;
            const targetStatus = data.ord_status || currentStatus;

            // Manejo de transiciones de stock
            const deductionMode = await this.getStockDeductionMode(cmp_uuid, { transaction });
            const wasDelivered = this.isDeliveredStatus(currentStatus);
            const willBeDelivered = this.isDeliveredStatus(targetStatus);

            // 1. De Pendiente a Entregado: Descontar stock (solo si el modo es ON_DELIVERY)
            if (!wasDelivered && willBeDelivered && deductionMode === 'ON_DELIVERY') {
                for (const detail of (currentOrder.details || [])) {
                    await this.stockMovementUseCase.registerMovement({
                        cmp_uuid,
                        prd_uuid: detail.prd_uuid,
                        usr_uuid: currentOrder.usr_uuid_seller,
                        stkm_type: 'ORDER_OUT',
                        stkm_quantity: -Math.abs(Number(detail.ordd_quantity)),
                        stkm_referenceuuid: ord_uuid,
                        stkm_notes: `Salida por entrega de pedido #${ord_uuid}`
                    }, { transaction });
                }
            }

            // 2. De Entregado a Cancelado: Reingresar stock al inventario (solo si fue descontado por ON_DELIVERY)
            if (wasDelivered && targetStatus === 'CANCELADO' && deductionMode === 'ON_DELIVERY') {
                for (const detail of (currentOrder.details || [])) {
                    await this.stockMovementUseCase.registerMovement({
                        cmp_uuid,
                        prd_uuid: detail.prd_uuid,
                        usr_uuid: currentOrder.usr_uuid_seller,
                        stkm_type: 'ORDER_CANCEL_IN',
                        stkm_quantity: Math.abs(Number(detail.ordd_quantity)),
                        stkm_referenceuuid: ord_uuid,
                        stkm_notes: `Reingreso por cancelación de pedido entregado #${ord_uuid}`
                    }, { transaction });
                }
            }

            // 2.1 Reversión de cuenta corriente: Si estaba en CUENTA_CORRIENTE y se cancela, asentar crédito
            if (currentStatus === 'CUENTA_CORRIENTE' && targetStatus === 'CANCELADO' && this.customerMovementUseCase) {
                await this.customerMovementUseCase.registerMovement({
                    cmp_uuid,
                    cus_uuid: currentOrder.cus_uuid,
                    usr_uuid: currentOrder.usr_uuid_driver || currentOrder.usr_uuid_seller,
                    cusm_type: 'CANCEL_CREDIT',
                    cusm_amount: Number(currentOrder.ord_totalamount),
                    ord_uuid,
                    cusm_notes: `Crédito por cancelación de pedido en Cta. Cte. #${ord_uuid}`
                }, { transaction });
            }

            // Si se suministran nuevos detalles y no estaba entregado, recalcular importes
            let newDetails: OrderDetailEntity[] | undefined = undefined;
            let newTotalAmount = currentOrder.ord_totalamount;

            if (data.details && data.details.length > 0) {
                if (wasDelivered) {
                    throw new Error("No se pueden modificar los ítems de un pedido que ya fue entregado.");
                }

                const customer = await this.customerRepository.findCustomerById(cmp_uuid, data.cus_uuid || currentOrder.cus_uuid, { transaction });
                const customerPriceTier = customer?.prct_uuid;

                newDetails = [];
                for (const item of data.details) {
                    const product = await this.productRepository.findProductById(cmp_uuid, item.prd_uuid, { transaction });
                    if (!product) {
                        throw new Error(`El producto con ID ${item.prd_uuid} no existe.`);
                    }
                    if (!product.prd_active) {
                        throw new Error(`El producto '${product.prd_name}' está inactivo y no se puede vender.`);
                    }
                    if (product.prd_type === 'SUPPLY') {
                        throw new Error(`El artículo '${product.prd_name}' es un insumo / materia prima y no puede ser vendido en un pedido.`);
                    }

                    let unitPrice = Number(item.ordd_unitprice);
                    if (isNaN(unitPrice) || unitPrice <= 0) {
                        const prices = await this.productRepository.getProductPrices(cmp_uuid, item.prd_uuid, { transaction });
                        const tierPrice = (prices || []).find(p => p.prct_uuid === customerPriceTier);
                        unitPrice = tierPrice ? Number(tierPrice.prdprc_price) : 0;
                    }

                    const quantity = Number(item.ordd_quantity);
                    newDetails.push({
                        cmp_uuid,
                        ord_uuid,
                        ordd_uuid: item.ordd_uuid || '',
                        prd_uuid: item.prd_uuid,
                        ordd_quantity: quantity,
                        ordd_unitprice: unitPrice,
                        ordd_subtotal: quantity * unitPrice
                    });
                }
                newTotalAmount = newDetails.reduce((sum, d) => sum + d.ordd_subtotal, 0);
            }

            // 3. Manejo de cuenta corriente: Si transiciona a CUENTA_CORRIENTE, asentar débito
            if (currentStatus !== 'CUENTA_CORRIENTE' && targetStatus === 'CUENTA_CORRIENTE' && this.customerMovementUseCase) {
                await this.customerMovementUseCase.registerMovement({
                    cmp_uuid,
                    cus_uuid: currentOrder.cus_uuid,
                    usr_uuid: currentOrder.usr_uuid_driver || currentOrder.usr_uuid_seller,
                    cusm_type: 'ORDER_DEBIT',
                    cusm_amount: Number(newTotalAmount),
                    ord_uuid,
                    cusm_notes: `Débito en Cta. Cte. por entrega de pedido #${ord_uuid}`
                }, { transaction });
            }

            const updatePayload: Partial<OrderEntity> = {
                cus_uuid: data.cus_uuid,
                usr_uuid_driver: data.usr_uuid_driver,
                ord_deliverydate: data.ord_deliverydate ? new Date(data.ord_deliverydate) : undefined,
                ord_status: targetStatus,
                ord_totalamount: newTotalAmount,
                ord_notes: data.ord_notes !== undefined ? (data.ord_notes ? data.ord_notes.trim() : null) : undefined,
                details: newDetails
            };

            const updatedOrder = await this.orderRepository.updateOrder(cmp_uuid, ord_uuid, updatePayload, { transaction });
            if (!updatedOrder) {
                throw new Error("No se pudo actualizar el pedido.");
            }

            if (shouldCommit) {
                await transaction.commit();
            }

            const finalOrder = await this.orderRepository.findOrderById(cmp_uuid, ord_uuid);
            return this.formatOrder(finalOrder || updatedOrder);
        } catch (error: any) {
            if (shouldCommit) {
                await transaction.rollback();
            }
            console.error("Error en updateOrder (use case):", error.message);
            throw error;
        }
    }

    public async deleteOrder(cmp_uuid: string, ord_uuid: string, options?: QueryOptions) {
        const transaction = options?.transaction || await sequelize.transaction();
        const shouldCommit = !options?.transaction;

        try {
            if (!cmp_uuid || !ord_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y ord_uuid válidos.");
            }

            const existing = await this.orderRepository.findOrderById(cmp_uuid, ord_uuid, { transaction });
            if (!existing) {
                throw new Error(`No existe el pedido con ID: ${ord_uuid}`);
            }

            if (this.isDeliveredStatus(existing.ord_status)) {
                throw new Error("No se puede eliminar un pedido en estado entregado. Primero debe cancelarlo para revertir el stock.");
            }

            const deleted = await this.orderRepository.deleteOrder(cmp_uuid, ord_uuid, { transaction });
            if (!deleted) {
                throw new Error("No se pudo eliminar el pedido.");
            }

            if (shouldCommit) {
                await transaction.commit();
            }

            return this.formatOrder(deleted);
        } catch (error: any) {
            if (shouldCommit) {
                await transaction.rollback();
            }
            console.error("Error en deleteOrder (use case):", error.message);
            throw error;
        }
    }
}
