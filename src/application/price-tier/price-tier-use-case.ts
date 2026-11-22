import { PriceTierRepository } from "../../domain/price-tier/price-tier.repository";
import { PriceTierValue } from "../../domain/price-tier/price-tier.value";
import { PriceTierEntity, PriceTierCreateInput, PriceTierUpdateData } from "../../domain/price-tier/price-tier.entity";
import { QueryOptions } from "../../domain/common";
import { TimezoneConverter } from "../../infrastructure/utils/TimezoneConverter";

export class PriceTierUseCase {
    constructor(
        private readonly priceTierRepository: PriceTierRepository
    ) {
        this.getPriceTiers = this.getPriceTiers.bind(this);
        this.getPriceTiersAndCount = this.getPriceTiersAndCount.bind(this);
        this.getDetailPriceTier = this.getDetailPriceTier.bind(this);
        this.createPriceTier = this.createPriceTier.bind(this);
        this.updatePriceTier = this.updatePriceTier.bind(this);
        this.deletePriceTier = this.deletePriceTier.bind(this);
        this.setDefaultPriceTier = this.setDefaultPriceTier.bind(this);
    }

    private formatPriceTier(tier: PriceTierEntity) {
        return {
            cmp_uuid: tier.cmp_uuid,
            prct_uuid: tier.prct_uuid,
            prct_code: tier.prct_code,
            prct_name: tier.prct_name,
            prct_description: tier.prct_description ?? null,
            prct_isdefault: Boolean(tier.prct_isdefault),
            prct_active: Boolean(tier.prct_active),
            prct_createdat: TimezoneConverter.toIsoStringInTimezone(tier.prct_createdat, 'America/Buenos_Aires'),
            prct_updatedat: TimezoneConverter.toIsoStringInTimezone(tier.prct_updatedat, 'America/Buenos_Aires')
        };
    }

    public async getPriceTiers(cmp_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid) {
                throw new Error("Debe proporcionar un identificador de empresa válido.");
            }
            const tiers = await this.priceTierRepository.getPriceTiers(cmp_uuid, options);
            if (!tiers) {
                return [];
            }
            return tiers.map(tier => this.formatPriceTier(tier));
        } catch (error: any) {
            console.error("Error en getPriceTiers (use case):", error.message);
            throw error;
        }
    }

    public async getPriceTiersAndCount(cmp_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid) {
                throw new Error("Debe proporcionar un identificador de empresa válido.");
            }
            const result = await this.priceTierRepository.getPriceTiersAndCount(cmp_uuid, options);
            if (!result) {
                return { count: 0, rows: [] };
            }
            return {
                count: result.count,
                rows: result.rows.map(tier => this.formatPriceTier(tier))
            };
        } catch (error: any) {
            console.error("Error en getPriceTiersAndCount (use case):", error.message);
            throw error;
        }
    }

    public async getDetailPriceTier(cmp_uuid: string, prct_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !prct_uuid) {
                throw new Error("Debe proporcionar el ID de empresa y de la lista de precios.");
            }
            const tier = await this.priceTierRepository.findPriceTierById(cmp_uuid, prct_uuid, options);
            if (!tier) {
                throw new Error(`No se encontró la lista de precios con ID: ${prct_uuid}`);
            }
            return this.formatPriceTier(tier);
        } catch (error: any) {
            console.error("Error en getDetailPriceTier (use case):", error.message);
            throw error;
        }
    }

    public async createPriceTier(input: PriceTierCreateInput, options?: QueryOptions) {
        try {
            if (!input.cmp_uuid) {
                throw new Error("Debe proporcionar el ID de la empresa.");
            }
            if (!input.prct_code || !input.prct_name) {
                throw new Error("El código y nombre de la lista de precios son obligatorios.");
            }

            const cleanCode = input.prct_code.trim().toUpperCase();
            const existing = await this.priceTierRepository.findPriceTierByCode(input.cmp_uuid, cleanCode, null, options);
            if (existing) {
                throw new Error(`Ya existe una lista de precios con el código '${cleanCode}' para esta empresa.`);
            }

            // Si es la primera lista de precios de la empresa o se especifica como default
            const existingTiers = await this.priceTierRepository.getPriceTiers(input.cmp_uuid, options);
            const isFirst = !existingTiers || existingTiers.length === 0;
            const shouldBeDefault = isFirst || Boolean(input.prct_isdefault);

            if (shouldBeDefault && !isFirst) {
                await this.priceTierRepository.clearDefaultFlag(input.cmp_uuid, undefined, options);
            }

            const priceTierValue = new PriceTierValue({
                ...input,
                prct_code: cleanCode,
                prct_isdefault: shouldBeDefault
            });

            const created = await this.priceTierRepository.createPriceTier(priceTierValue, options);
            if (!created) {
                throw new Error("No se pudo registrar la lista de precios.");
            }
            return this.formatPriceTier(created);
        } catch (error: any) {
            console.error("Error en createPriceTier (use case):", error.message);
            throw error;
        }
    }

    public async updatePriceTier(cmp_uuid: string, prct_uuid: string, data: PriceTierUpdateData, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !prct_uuid) {
                throw new Error("Debe proporcionar el ID de empresa y de la lista de precios.");
            }

            const existing = await this.priceTierRepository.findPriceTierById(cmp_uuid, prct_uuid, options);
            if (!existing) {
                throw new Error(`No existe la lista de precios con ID: ${prct_uuid}`);
            }

            if (data.prct_code) {
                const cleanCode = data.prct_code.trim().toUpperCase();
                const codeConflict = await this.priceTierRepository.findPriceTierByCode(cmp_uuid, cleanCode, prct_uuid, options);
                if (codeConflict) {
                    throw new Error(`El código '${cleanCode}' ya está siendo utilizado por otra lista de precios.`);
                }
                data.prct_code = cleanCode;
            }

            if (data.prct_isdefault === true) {
                await this.priceTierRepository.clearDefaultFlag(cmp_uuid, prct_uuid, options);
            }

            const updated = await this.priceTierRepository.updatePriceTier(cmp_uuid, prct_uuid, data, options);
            if (!updated) {
                throw new Error("No se pudo actualizar la lista de precios.");
            }
            return this.formatPriceTier(updated);
        } catch (error: any) {
            console.error("Error en updatePriceTier (use case):", error.message);
            throw error;
        }
    }

    public async deletePriceTier(cmp_uuid: string, prct_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !prct_uuid) {
                throw new Error("Debe proporcionar el ID de empresa y de la lista de precios.");
            }

            const existing = await this.priceTierRepository.findPriceTierById(cmp_uuid, prct_uuid, options);
            if (!existing) {
                throw new Error(`No existe la lista de precios con ID: ${prct_uuid}`);
            }

            const deleted = await this.priceTierRepository.deletePriceTier(cmp_uuid, prct_uuid, options);
            if (!deleted) {
                throw new Error("No se pudo eliminar la lista de precios.");
            }
            return this.formatPriceTier(deleted);
        } catch (error: any) {
            console.error("Error en deletePriceTier (use case):", error.message);
            throw error;
        }
    }

    public async setDefaultPriceTier(cmp_uuid: string, prct_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !prct_uuid) {
                throw new Error("Debe proporcionar el ID de empresa y de la lista de precios.");
            }

            const existing = await this.priceTierRepository.findPriceTierById(cmp_uuid, prct_uuid, options);
            if (!existing) {
                throw new Error(`No existe la lista de precios con ID: ${prct_uuid}`);
            }

            await this.priceTierRepository.clearDefaultFlag(cmp_uuid, prct_uuid, options);
            const updated = await this.priceTierRepository.updatePriceTier(cmp_uuid, prct_uuid, { prct_isdefault: true }, options);
            if (!updated) {
                throw new Error("No se pudo establecer la lista de precios por defecto.");
            }
            return this.formatPriceTier(updated);
        } catch (error: any) {
            console.error("Error en setDefaultPriceTier (use case):", error.message);
            throw error;
        }
    }
}
