import { ProductionOrderRepository } from "../../domain/production-order/production-order.repository";
import { ProductionOrderValue } from "../../domain/production-order/production-order.value";
import { ProductionOrderEntity, ProductionOrderCreateInput, ProductionOrderUpdateData } from "../../domain/production-order/production-order.entity";
import { ProductRepository } from "../../domain/product/product.repository";
import { ProductBomRepository } from "../../domain/product-bom/product-bom.repository";
import { MachineRepository } from "../../domain/machine/machine.repository";
import { StockMovementUseCase } from "../stock-movement/stock-movement-use-case";
import { QueryOptions } from "../../domain/common";
import { TimezoneConverter } from "../../infrastructure/utils/TimezoneConverter";

export class ProductionOrderUseCase {
    constructor(
        private readonly productionOrderRepository: ProductionOrderRepository,
        private readonly productRepository: ProductRepository,
        private readonly productBomRepository: ProductBomRepository,
        private readonly machineRepository: MachineRepository,
        private readonly stockMovementUseCase: StockMovementUseCase
    ) {
        this.getProductionOrders = this.getProductionOrders.bind(this);
        this.getProductionOrdersAndCount = this.getProductionOrdersAndCount.bind(this);
        this.getDetailProductionOrder = this.getDetailProductionOrder.bind(this);
        this.createProductionOrder = this.createProductionOrder.bind(this);
        this.updateProductionOrder = this.updateProductionOrder.bind(this);
        this.deleteProductionOrder = this.deleteProductionOrder.bind(this);
    }

    private formatOrder(order: ProductionOrderEntity) {
        return {
            cmp_uuid: order.cmp_uuid,
            prdord_uuid: order.prdord_uuid,
            mch_uuid: order.mch_uuid ?? null,
            prd_uuid: order.prd_uuid,
            usr_uuid: order.usr_uuid,
            prdord_producedqty: Number(order.prdord_producedqty),
            prdord_wasteqty: Number(order.prdord_wasteqty),
            prdord_status: order.prdord_status,
            prdord_productiondate: TimezoneConverter.toIsoStringInTimezone(order.prdord_productiondate, 'America/Buenos_Aires'),
            prdord_notes: order.prdord_notes ?? null,
            prdord_createdat: TimezoneConverter.toIsoStringInTimezone(order.prdord_createdat, 'America/Buenos_Aires'),
            prdord_updatedat: TimezoneConverter.toIsoStringInTimezone(order.prdord_updatedat, 'America/Buenos_Aires'),
            product: order.product ? {
                prd_uuid: order.product.prd_uuid,
                prd_code: order.product.prd_code,
                prd_name: order.product.prd_name,
                prd_unitlabel: order.product.prd_unitlabel
            } : undefined,
            machine: order.machine ? {
                mch_uuid: order.machine.mch_uuid,
                mch_name: order.machine.mch_name
            } : undefined,
            user: order.user ? {
                usr_uuid: order.user.usr_uuid,
                usr_nick: order.user.usr_nick,
                usr_name: order.user.usr_name,
                usr_surname: order.user.usr_surname
            } : undefined
        };
    }

    private async processOrderMovements(order: ProductionOrderEntity, options?: QueryOptions) {
        const producedQty = Number(order.prdord_producedqty);
        const wasteQty = Number(order.prdord_wasteqty);

        // 1. Ingreso de producto terminado al Kardex
        if (producedQty > 0) {
            await this.stockMovementUseCase.registerMovement({
                cmp_uuid: order.cmp_uuid,
                prd_uuid: order.prd_uuid,
                usr_uuid: order.usr_uuid,
                stkm_type: 'PRODUCTION_IN',
                stkm_quantity: producedQty,
                stkm_referenceuuid: order.prdord_uuid,
                stkm_notes: `Ingreso por orden de producción ${order.prdord_uuid}`
            }, options);
        }

        // 2. Registro de merma si existió
        if (wasteQty > 0) {
            await this.stockMovementUseCase.registerMovement({
                cmp_uuid: order.cmp_uuid,
                prd_uuid: order.prd_uuid,
                usr_uuid: order.usr_uuid,
                stkm_type: 'WASTE',
                stkm_quantity: -wasteQty,
                stkm_referenceuuid: order.prdord_uuid,
                stkm_notes: `Merma en orden de producción ${order.prdord_uuid}`
            }, options);
        }

        // 3. Descuento automático de insumos según Receta BOM
        const bomItems = await this.productBomRepository.getBomByFinishedProduct(order.cmp_uuid, order.prd_uuid, options);
        if (bomItems && bomItems.length > 0) {
            for (const item of bomItems) {
                const consumedQty = Number(item.prdbom_quantityperunit) * producedQty;
                if (consumedQty > 0) {
                    await this.stockMovementUseCase.registerMovement({
                        cmp_uuid: order.cmp_uuid,
                        prd_uuid: item.prd_uuid_supply,
                        usr_uuid: order.usr_uuid,
                        stkm_type: 'BOM_CONSUMPTION',
                        stkm_quantity: -consumedQty,
                        stkm_referenceuuid: order.prdord_uuid,
                        stkm_notes: `Consumo de insumo para orden de producción ${order.prdord_uuid}`
                    }, options);
                }
            }
        }
    }

    public async getProductionOrders(cmp_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid) {
                throw new Error("Debe proporcionar un identificador de empresa válido.");
            }
            const orders = await this.productionOrderRepository.getProductionOrders(cmp_uuid, options);
            if (!orders) {
                return [];
            }
            return orders.map(o => this.formatOrder(o));
        } catch (error: any) {
            console.error("Error en getProductionOrders (use case):", error.message);
            throw error;
        }
    }

    public async getProductionOrdersAndCount(cmp_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid) {
                throw new Error("Debe proporcionar un identificador de empresa válido.");
            }
            const result = await this.productionOrderRepository.getProductionOrdersAndCount(cmp_uuid, options);
            if (!result) {
                return { count: 0, rows: [] };
            }
            return {
                count: result.count,
                rows: result.rows.map(o => this.formatOrder(o))
            };
        } catch (error: any) {
            console.error("Error en getProductionOrdersAndCount (use case):", error.message);
            throw error;
        }
    }

    public async getDetailProductionOrder(cmp_uuid: string, prdord_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !prdord_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y prdord_uuid válidos.");
            }
            const order = await this.productionOrderRepository.findProductionOrderById(cmp_uuid, prdord_uuid, options);
            if (!order) {
                throw new Error(`No se encontró la orden de producción con ID: ${prdord_uuid}`);
            }
            return this.formatOrder(order);
        } catch (error: any) {
            console.error("Error en getDetailProductionOrder (use case):", error.message);
            throw error;
        }
    }

    public async createProductionOrder(input: ProductionOrderCreateInput, options?: QueryOptions) {
        try {
            const { cmp_uuid, prd_uuid, mch_uuid, usr_uuid } = input;
            if (!cmp_uuid || !prd_uuid || !usr_uuid) {
                throw new Error("cmp_uuid, prd_uuid y usr_uuid son obligatorios.");
            }

            // Validar existencia de producto
            const product = await this.productRepository.findProductById(cmp_uuid, prd_uuid, options);
            if (!product) {
                throw new Error(`El producto con ID ${prd_uuid} no existe en la empresa.`);
            }

            // Validar máquina si se proveyó
            if (mch_uuid) {
                const machine = await this.machineRepository.findMachineById(cmp_uuid, mch_uuid, options);
                if (!machine) {
                    throw new Error(`La máquina con ID ${mch_uuid} no existe en la empresa.`);
                }
            }

            const orderValue = new ProductionOrderValue(input);
            const created = await this.productionOrderRepository.createProductionOrder(orderValue, options);
            if (!created) {
                throw new Error("No se pudo asentar la orden de producción.");
            }

            // Si se crea en estado COMPLETED, procesar de forma inmediata el movimiento de stock y la receta BOM
            if (created.prdord_status === 'COMPLETED') {
                await this.processOrderMovements(created, options);
            }

            return this.formatOrder(created);
        } catch (error: any) {
            console.error("Error en createProductionOrder (use case):", error.message);
            throw error;
        }
    }

    public async updateProductionOrder(cmp_uuid: string, prdord_uuid: string, data: ProductionOrderUpdateData, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !prdord_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y prdord_uuid válidos.");
            }

            const existing = await this.productionOrderRepository.findProductionOrderById(cmp_uuid, prdord_uuid, options);
            if (!existing) {
                throw new Error(`No existe la orden de producción con ID: ${prdord_uuid}`);
            }

            const wasNotCompleted = existing.prdord_status !== 'COMPLETED';
            const willBeCompleted = data.prdord_status === 'COMPLETED';

            const updated = await this.productionOrderRepository.updateProductionOrder(cmp_uuid, prdord_uuid, data, options);
            if (!updated) {
                throw new Error("No se pudo actualizar la orden de producción.");
            }

            // Si cambió de estado hacia COMPLETED, procesar movimientos y receta BOM
            if (wasNotCompleted && willBeCompleted) {
                await this.processOrderMovements(updated, options);
            }

            return this.formatOrder(updated);
        } catch (error: any) {
            console.error("Error en updateProductionOrder (use case):", error.message);
            throw error;
        }
    }

    public async deleteProductionOrder(cmp_uuid: string, prdord_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !prdord_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y prdord_uuid válidos.");
            }

            const existing = await this.productionOrderRepository.findProductionOrderById(cmp_uuid, prdord_uuid, options);
            if (!existing) {
                throw new Error(`No existe la orden de producción con ID: ${prdord_uuid}`);
            }

            const deleted = await this.productionOrderRepository.deleteProductionOrder(cmp_uuid, prdord_uuid, options);
            if (!deleted) {
                throw new Error("No se pudo eliminar la orden de producción.");
            }
            return this.formatOrder(deleted);
        } catch (error: any) {
            console.error("Error en deleteProductionOrder (use case):", error.message);
            throw error;
        }
    }
}
