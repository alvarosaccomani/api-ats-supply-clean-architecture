import { StockMovementRepository } from "../../domain/stock-movement/stock-movement.repository";
import { StockMovementValue } from "../../domain/stock-movement/stock-movement.value";
import { StockMovementEntity, StockMovementType } from "../../domain/stock-movement/stock-movement.entity";
import { ProductRepository } from "../../domain/product/product.repository";
import { QueryOptions } from "../../domain/common";
import { TimezoneConverter } from "../../infrastructure/utils/TimezoneConverter";

export interface RegisterMovementDTO {
    cmp_uuid: string;
    prd_uuid: string;
    usr_uuid: string;
    stkm_type: StockMovementType;
    stkm_quantity: number;
    stkm_referenceuuid?: string | null;
    stkm_notes?: string | null;
}

export class StockMovementUseCase {
    constructor(
        private readonly stockMovementRepository: StockMovementRepository,
        private readonly productRepository: ProductRepository
    ) {
        this.getMovements = this.getMovements.bind(this);
        this.getMovementsAndCount = this.getMovementsAndCount.bind(this);
        this.getDetailMovement = this.getDetailMovement.bind(this);
        this.registerMovement = this.registerMovement.bind(this);
    }

    private formatMovement(movement: StockMovementEntity) {
        return {
            cmp_uuid: movement.cmp_uuid,
            stkm_uuid: movement.stkm_uuid,
            prd_uuid: movement.prd_uuid,
            usr_uuid: movement.usr_uuid,
            stkm_type: movement.stkm_type,
            stkm_quantity: Number(movement.stkm_quantity),
            stkm_previousstock: Number(movement.stkm_previousstock),
            stkm_newstock: Number(movement.stkm_newstock),
            stkm_referenceuuid: movement.stkm_referenceuuid ?? null,
            stkm_notes: movement.stkm_notes ?? null,
            stkm_createdat: TimezoneConverter.toIsoStringInTimezone(movement.stkm_createdat, 'America/Buenos_Aires'),
            stkm_updatedat: TimezoneConverter.toIsoStringInTimezone(movement.stkm_updatedat, 'America/Buenos_Aires'),
            product: movement.product ? {
                prd_uuid: movement.product.prd_uuid,
                prd_code: movement.product.prd_code,
                prd_name: movement.product.prd_name,
                prd_type: movement.product.prd_type,
                prd_unitlabel: movement.product.prd_unitlabel
            } : undefined,
            user: movement.user ? {
                usr_uuid: movement.user.usr_uuid,
                usr_nick: movement.user.usr_nick,
                usr_name: movement.user.usr_name,
                usr_surname: movement.user.usr_surname
            } : undefined
        };
    }

    public async getMovements(cmp_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid) {
                throw new Error("Debe proporcionar un identificador de empresa válido.");
            }
            const movements = await this.stockMovementRepository.getMovements(cmp_uuid, options);
            if (!movements) {
                return [];
            }
            return movements.map(m => this.formatMovement(m));
        } catch (error: any) {
            console.error("Error en getMovements (use case):", error.message);
            throw error;
        }
    }

    public async getMovementsAndCount(cmp_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid) {
                throw new Error("Debe proporcionar un identificador de empresa válido.");
            }
            const result = await this.stockMovementRepository.getMovementsAndCount(cmp_uuid, options);
            if (!result) {
                return { count: 0, rows: [] };
            }
            return {
                count: result.count,
                rows: result.rows.map(m => this.formatMovement(m))
            };
        } catch (error: any) {
            console.error("Error en getMovementsAndCount (use case):", error.message);
            throw error;
        }
    }

    public async getDetailMovement(cmp_uuid: string, stkm_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !stkm_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y stkm_uuid válidos.");
            }
            const movement = await this.stockMovementRepository.findMovementById(cmp_uuid, stkm_uuid, options);
            if (!movement) {
                throw new Error(`No se encontró el movimiento de stock con ID: ${stkm_uuid}`);
            }
            return this.formatMovement(movement);
        } catch (error: any) {
            console.error("Error en getDetailMovement (use case):", error.message);
            throw error;
        }
    }

    public async registerMovement(input: RegisterMovementDTO, options?: QueryOptions) {
        try {
            const { cmp_uuid, prd_uuid, usr_uuid, stkm_type, stkm_quantity, stkm_referenceuuid, stkm_notes } = input;
            if (!cmp_uuid || !prd_uuid || !usr_uuid) {
                throw new Error("cmp_uuid, prd_uuid y usr_uuid son campos obligatorios.");
            }

            const qty = Number(stkm_quantity);
            if (isNaN(qty) || qty === 0) {
                throw new Error("La cantidad del movimiento debe ser un número diferente de cero.");
            }

            // Validar que el producto exista en la compañía
            const product = await this.productRepository.findProductById(cmp_uuid, prd_uuid, options);
            if (!product) {
                throw new Error(`El producto con ID ${prd_uuid} no existe en la empresa.`);
            }

            const previousStock = Number(product.prd_currentstock) || 0.0;
            const newStock = previousStock + qty;

            const movementValue = new StockMovementValue({
                cmp_uuid,
                prd_uuid,
                usr_uuid,
                stkm_type,
                stkm_quantity: qty,
                stkm_previousstock: previousStock,
                stkm_newstock: newStock,
                stkm_referenceuuid,
                stkm_notes
            });

            // Registrar movimiento en el libro mayor
            const created = await this.stockMovementRepository.createMovement(movementValue, options);
            if (!created) {
                throw new Error("No se pudo asentar el movimiento en el Kardex.");
            }

            // Actualizar stock de balance en el catálogo del producto
            await this.productRepository.updateProductStock(cmp_uuid, prd_uuid, newStock, options);

            return this.formatMovement({
                ...created,
                product
            });
        } catch (error: any) {
            console.error("Error en registerMovement (use case):", error.message);
            throw error;
        }
    }
}
