import { MachineEntity, MachineCreateInput, MachineUpdateData } from "../../../domain/machine/machine.entity";
import { MachineRepository } from "../../../domain/machine/machine.repository";
import { SequelizeMachine } from "../../model/machine/machine.model";
import { QueryOptions } from "../../../domain/common";
import { Op } from "sequelize";

export class SequelizeMachineRepository implements MachineRepository {
    async getMachines(cmp_uuid: string, options?: QueryOptions): Promise<MachineEntity[] | null> {
        try {
            const whereClause: any = { cmp_uuid };
            if (options?.where) {
                Object.assign(whereClause, options.where);
            }

            const machines = await SequelizeMachine.findAll({
                where: whereClause,
                limit: options?.limit,
                offset: options?.offset,
                order: options?.order ?? [['mch_name', 'ASC']],
                transaction: options?.transaction
            });

            if (!machines) {
                return null;
            }
            return machines.map(m => m.get({ plain: true }) as MachineEntity);
        } catch (error: any) {
            console.error("Error en getMachines (repository):", error.message);
            throw error;
        }
    }

    async getMachinesAndCount(cmp_uuid: string, options?: QueryOptions): Promise<{ count: number; rows: MachineEntity[] } | null> {
        try {
            const whereClause: any = { cmp_uuid };
            if (options?.where) {
                Object.assign(whereClause, options.where);
            }

            const { count, rows } = await SequelizeMachine.findAndCountAll({
                where: whereClause,
                limit: options?.limit,
                offset: options?.offset,
                order: options?.order ?? [['mch_name', 'ASC']],
                transaction: options?.transaction
            });

            return {
                count,
                rows: rows.map(m => m.get({ plain: true }) as MachineEntity)
            };
        } catch (error: any) {
            console.error("Error en getMachinesAndCount (repository):", error.message);
            throw error;
        }
    }

    async findMachineById(cmp_uuid: string, mch_uuid: string, options?: QueryOptions): Promise<MachineEntity | null> {
        try {
            const machine = await SequelizeMachine.findOne({
                where: { cmp_uuid, mch_uuid },
                transaction: options?.transaction
            });
            if (!machine) {
                return null;
            }
            return machine.get({ plain: true }) as MachineEntity;
        } catch (error: any) {
            console.error("Error en findMachineById (repository):", error.message);
            throw error;
        }
    }

    async findMachineByName(cmp_uuid: string, mch_name: string, excludeUuid?: string | null, options?: QueryOptions): Promise<MachineEntity | null> {
        try {
            const whereClause: any = {
                cmp_uuid,
                mch_name: mch_name.trim()
            };
            if (excludeUuid) {
                whereClause.mch_uuid = { [Op.ne]: excludeUuid };
            }

            const machine = await SequelizeMachine.findOne({
                where: whereClause,
                transaction: options?.transaction
            });
            if (!machine) {
                return null;
            }
            return machine.get({ plain: true }) as MachineEntity;
        } catch (error: any) {
            console.error("Error en findMachineByName (repository):", error.message);
            throw error;
        }
    }

    async createMachine(machine: MachineCreateInput, options?: QueryOptions): Promise<MachineEntity | null> {
        try {
            const result = await SequelizeMachine.create(machine as any, { transaction: options?.transaction });
            if (!result) {
                return null;
            }
            return result.get({ plain: true }) as MachineEntity;
        } catch (error: any) {
            console.error("Error en createMachine (repository):", error.message);
            throw error;
        }
    }

    async updateMachine(cmp_uuid: string, mch_uuid: string, machine: MachineUpdateData, options?: QueryOptions): Promise<MachineEntity | null> {
        try {
            const existing = await SequelizeMachine.findOne({
                where: { cmp_uuid, mch_uuid },
                transaction: options?.transaction
            });
            if (!existing) {
                return null;
            }

            await existing.update(machine as any, { transaction: options?.transaction });
            return existing.get({ plain: true }) as MachineEntity;
        } catch (error: any) {
            console.error("Error en updateMachine (repository):", error.message);
            throw error;
        }
    }

    async deleteMachine(cmp_uuid: string, mch_uuid: string, options?: QueryOptions): Promise<MachineEntity | null> {
        try {
            const existing = await SequelizeMachine.findOne({
                where: { cmp_uuid, mch_uuid },
                transaction: options?.transaction
            });
            if (!existing) {
                return null;
            }

            const deleted = existing.get({ plain: true }) as MachineEntity;
            await existing.destroy({ transaction: options?.transaction });
            return deleted;
        } catch (error: any) {
            console.error("Error en deleteMachine (repository):", error.message);
            throw error;
        }
    }
}
