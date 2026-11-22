import { ProductBomRepository } from "../../domain/product-bom/product-bom.repository";
import { ProductBomValue } from "../../domain/product-bom/product-bom.value";
import { ProductBomEntity, ProductBomUpdateData, RecipeItemInput } from "../../domain/product-bom/product-bom.entity";
import { ProductRepository } from "../../domain/product/product.repository";
import { QueryOptions } from "../../domain/common";
import { TimezoneConverter } from "../../infrastructure/utils/TimezoneConverter";

export class ProductBomUseCase {
    constructor(
        private readonly productBomRepository: ProductBomRepository,
        private readonly productRepository: ProductRepository
    ) {
        this.getRecipe = this.getRecipe.bind(this);
        this.getBomItemsAndCount = this.getBomItemsAndCount.bind(this);
        this.getDetailBomItem = this.getDetailBomItem.bind(this);
        this.addOrUpdateBomItem = this.addOrUpdateBomItem.bind(this);
        this.setFullRecipe = this.setFullRecipe.bind(this);
        this.deleteBomItem = this.deleteBomItem.bind(this);
        this.deleteRecipe = this.deleteRecipe.bind(this);
    }

    private formatBomItem(item: ProductBomEntity) {
        return {
            cmp_uuid: item.cmp_uuid,
            prdbom_uuid: item.prdbom_uuid,
            prd_uuid_finished: item.prd_uuid_finished,
            prd_uuid_supply: item.prd_uuid_supply,
            prdbom_quantityperunit: Number(item.prdbom_quantityperunit),
            prdbom_createdat: TimezoneConverter.toIsoStringInTimezone(item.prdbom_createdat, 'America/Buenos_Aires'),
            prdbom_updatedat: TimezoneConverter.toIsoStringInTimezone(item.prdbom_updatedat, 'America/Buenos_Aires'),
            finishedProduct: item.finishedProduct ? {
                prd_uuid: item.finishedProduct.prd_uuid,
                prd_code: item.finishedProduct.prd_code,
                prd_name: item.finishedProduct.prd_name,
                prd_unitlabel: item.finishedProduct.prd_unitlabel
            } : undefined,
            supplyProduct: item.supplyProduct ? {
                prd_uuid: item.supplyProduct.prd_uuid,
                prd_code: item.supplyProduct.prd_code,
                prd_name: item.supplyProduct.prd_name,
                prd_unitlabel: item.supplyProduct.prd_unitlabel,
                prd_currentstock: Number(item.supplyProduct.prd_currentstock) || 0
            } : undefined
        };
    }

    public async getRecipe(cmp_uuid: string, prd_uuid_finished: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !prd_uuid_finished) {
                throw new Error("Debe proporcionar cmp_uuid y prd_uuid_finished válidos.");
            }
            const items = await this.productBomRepository.getBomByFinishedProduct(cmp_uuid, prd_uuid_finished, options);
            if (!items) {
                return [];
            }
            return items.map(item => this.formatBomItem(item));
        } catch (error: any) {
            console.error("Error en getRecipe (use case):", error.message);
            throw error;
        }
    }

    public async getBomItemsAndCount(cmp_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid) {
                throw new Error("Debe proporcionar un identificador de empresa válido.");
            }
            const result = await this.productBomRepository.getBomAndCount(cmp_uuid, options);
            if (!result) {
                return { count: 0, rows: [] };
            }
            return {
                count: result.count,
                rows: result.rows.map(item => this.formatBomItem(item))
            };
        } catch (error: any) {
            console.error("Error en getBomItemsAndCount (use case):", error.message);
            throw error;
        }
    }

    public async getDetailBomItem(cmp_uuid: string, prdbom_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !prdbom_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y prdbom_uuid válidos.");
            }
            const item = await this.productBomRepository.findBomItemById(cmp_uuid, prdbom_uuid, options);
            if (!item) {
                throw new Error(`No se encontró el ítem de receta con ID: ${prdbom_uuid}`);
            }
            return this.formatBomItem(item);
        } catch (error: any) {
            console.error("Error en getDetailBomItem (use case):", error.message);
            throw error;
        }
    }

    public async addOrUpdateBomItem(cmp_uuid: string, prd_uuid_finished: string, prd_uuid_supply: string, quantity: number, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !prd_uuid_finished || !prd_uuid_supply) {
                throw new Error("cmp_uuid, prd_uuid_finished y prd_uuid_supply son obligatorios.");
            }
            if (prd_uuid_finished === prd_uuid_supply) {
                throw new Error("Un producto no puede ser su propio insumo en la receta.");
            }

            const qty = Number(quantity);
            if (isNaN(qty) || qty <= 0) {
                throw new Error("La cantidad por unidad debe ser un número positivo.");
            }

            // Validar existencia de ambos productos
            const finishedProduct = await this.productRepository.findProductById(cmp_uuid, prd_uuid_finished, options);
            if (!finishedProduct) {
                throw new Error(`El producto a fabricar (${prd_uuid_finished}) no existe en la empresa.`);
            }

            const supplyProduct = await this.productRepository.findProductById(cmp_uuid, prd_uuid_supply, options);
            if (!supplyProduct) {
                throw new Error(`El insumo consumido (${prd_uuid_supply}) no existe en la empresa.`);
            }

            const existing = await this.productBomRepository.findBomItem(cmp_uuid, prd_uuid_finished, prd_uuid_supply, options);
            if (existing) {
                const updated = await this.productBomRepository.updateBomItem(
                    cmp_uuid,
                    existing.prdbom_uuid,
                    { prdbom_quantityperunit: qty },
                    options
                );
                if (!updated) {
                    throw new Error("No se pudo actualizar la cantidad del insumo en la receta.");
                }
                return this.formatBomItem(updated);
            }

            const bomValue = new ProductBomValue({
                cmp_uuid,
                prd_uuid_finished,
                prd_uuid_supply,
                prdbom_quantityperunit: qty
            });

            const created = await this.productBomRepository.createBomItem(bomValue, options);
            if (!created) {
                throw new Error("No se pudo agregar el insumo a la receta.");
            }
            return this.formatBomItem(created);
        } catch (error: any) {
            console.error("Error en addOrUpdateBomItem (use case):", error.message);
            throw error;
        }
    }

    public async setFullRecipe(cmp_uuid: string, prd_uuid_finished: string, items: RecipeItemInput[], options?: QueryOptions) {
        try {
            if (!cmp_uuid || !prd_uuid_finished) {
                throw new Error("Debe proporcionar cmp_uuid y prd_uuid_finished válidos.");
            }
            if (!Array.isArray(items)) {
                throw new Error("Los ítems de la receta deben ser proporcionados como una lista.");
            }

            // Validar existencia del producto terminado
            const finishedProduct = await this.productRepository.findProductById(cmp_uuid, prd_uuid_finished, options);
            if (!finishedProduct) {
                throw new Error(`El producto a fabricar (${prd_uuid_finished}) no existe en la empresa.`);
            }

            // Validar que cada insumo exista y sea válido
            for (const item of items) {
                if (item.prd_uuid_supply === prd_uuid_finished) {
                    throw new Error("Un producto no puede ser su propio insumo en la receta.");
                }
                const qty = Number(item.prdbom_quantityperunit);
                if (isNaN(qty) || qty <= 0) {
                    throw new Error(`La cantidad para el insumo ${item.prd_uuid_supply} debe ser mayor a cero.`);
                }
                const supplyProduct = await this.productRepository.findProductById(cmp_uuid, item.prd_uuid_supply, options);
                if (!supplyProduct) {
                    throw new Error(`El insumo ${item.prd_uuid_supply} no existe en la empresa.`);
                }
            }

            const recipe = await this.productBomRepository.setRecipeItems(cmp_uuid, prd_uuid_finished, items, options);
            if (!recipe) {
                return [];
            }
            return recipe.map(item => this.formatBomItem(item));
        } catch (error: any) {
            console.error("Error en setFullRecipe (use case):", error.message);
            throw error;
        }
    }

    public async deleteBomItem(cmp_uuid: string, prdbom_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !prdbom_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y prdbom_uuid válidos.");
            }
            const deleted = await this.productBomRepository.deleteBomItem(cmp_uuid, prdbom_uuid, options);
            if (!deleted) {
                throw new Error(`No se encontró o no se pudo eliminar el ítem de receta con ID: ${prdbom_uuid}`);
            }
            return this.formatBomItem(deleted);
        } catch (error: any) {
            console.error("Error en deleteBomItem (use case):", error.message);
            throw error;
        }
    }

    public async deleteRecipe(cmp_uuid: string, prd_uuid_finished: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !prd_uuid_finished) {
                throw new Error("Debe proporcionar cmp_uuid y prd_uuid_finished válidos.");
            }
            const affectedCount = await this.productBomRepository.deleteBomByFinishedProduct(cmp_uuid, prd_uuid_finished, options);
            return {
                deletedCount: affectedCount
            };
        } catch (error: any) {
            console.error("Error en deleteRecipe (use case):", error.message);
            throw error;
        }
    }
}
