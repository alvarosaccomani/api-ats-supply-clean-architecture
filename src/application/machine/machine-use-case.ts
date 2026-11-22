import { MachineRepository } from "../../domain/machine/machine.repository";
import { MachineValue } from "../../domain/machine/machine.value";
import { MachineEntity, MachineCreateInput, MachineUpdateData } from "../../domain/machine/machine.entity";
import { QueryOptions } from "../../domain/common";
import { TimezoneConverter } from "../../infrastructure/utils/TimezoneConverter";

export class MachineUseCase {
    constructor(
        private readonly machineRepository: MachineRepository
    ) {
        this.getMachines = this.getMachines.bind(this);
        this.getMachinesAndCount = this.getMachinesAndCount.bind(this);
        this.getDetailMachine = this.getDetailMachine.bind(this);
        this.createMachine = this.createMachine.bind(this);
        this.updateMachine = this.updateMachine.bind(this);
        this.deleteMachine = this.deleteMachine.bind(this);
    }

    private formatMachine(machine: MachineEntity) {
        return {
            cmp_uuid: machine.cmp_uuid,
            mch_uuid: machine.mch_uuid,
            mch_name: machine.mch_name,
            mch_description: machine.mch_description ?? null,
            mch_dailycapacity: machine.mch_dailycapacity !== null && machine.mch_dailycapacity !== undefined 
                ? Number(machine.mch_dailycapacity) 
                : null,
            mch_active: Boolean(machine.mch_active),
            mch_createdat: TimezoneConverter.toIsoStringInTimezone(machine.mch_createdat, 'America/Buenos_Aires'),
            mch_updatedat: TimezoneConverter.toIsoStringInTimezone(machine.mch_updatedat, 'America/Buenos_Aires')
        };
    }

    public async getMachines(cmp_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid) {
                throw new Error("Debe proporcionar un identificador de empresa válido.");
            }
            const machines = await this.machineRepository.getMachines(cmp_uuid, options);
            if (!machines) {
                return [];
            }
            return machines.map(m => this.formatMachine(m));
        } catch (error: any) {
            console.error("Error en getMachines (use case):", error.message);
            throw error;
        }
    }

    public async getMachinesAndCount(cmp_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid) {
                throw new Error("Debe proporcionar un identificador de empresa válido.");
            }
            const result = await this.machineRepository.getMachinesAndCount(cmp_uuid, options);
            if (!result) {
                return { count: 0, rows: [] };
            }
            return {
                count: result.count,
                rows: result.rows.map(m => this.formatMachine(m))
            };
        } catch (error: any) {
            console.error("Error en getMachinesAndCount (use case):", error.message);
            throw error;
        }
    }

    public async getDetailMachine(cmp_uuid: string, mch_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !mch_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y mch_uuid válidos.");
            }
            const machine = await this.machineRepository.findMachineById(cmp_uuid, mch_uuid, options);
            if (!machine) {
                throw new Error(`No se encontró la máquina con ID: ${mch_uuid}`);
            }
            return this.formatMachine(machine);
        } catch (error: any) {
            console.error("Error en getDetailMachine (use case):", error.message);
            throw error;
        }
    }

    public async createMachine(input: MachineCreateInput, options?: QueryOptions) {
        try {
            if (!input.cmp_uuid) {
                throw new Error("Debe proporcionar el identificador de la empresa (cmp_uuid).");
            }
            if (!input.mch_name || input.mch_name.trim() === '') {
                throw new Error("El nombre de la máquina es obligatorio.");
            }

            const cleanName = input.mch_name.trim();
            const existing = await this.machineRepository.findMachineByName(input.cmp_uuid, cleanName, null, options);
            if (existing) {
                throw new Error(`Ya existe una máquina registrada con el nombre '${cleanName}' en esta empresa.`);
            }

            const machineValue = new MachineValue(input);
            const created = await this.machineRepository.createMachine(machineValue, options);
            if (!created) {
                throw new Error("No se pudo registrar la máquina.");
            }
            return this.formatMachine(created);
        } catch (error: any) {
            console.error("Error en createMachine (use case):", error.message);
            throw error;
        }
    }

    public async updateMachine(cmp_uuid: string, mch_uuid: string, data: MachineUpdateData, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !mch_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y mch_uuid válidos.");
            }

            const existing = await this.machineRepository.findMachineById(cmp_uuid, mch_uuid, options);
            if (!existing) {
                throw new Error(`No existe la máquina con ID: ${mch_uuid}`);
            }

            if (data.mch_name && data.mch_name.trim() !== '') {
                const cleanName = data.mch_name.trim();
                const conflict = await this.machineRepository.findMachineByName(cmp_uuid, cleanName, mch_uuid, options);
                if (conflict) {
                    throw new Error(`El nombre '${cleanName}' ya está siendo utilizado por otra máquina.`);
                }
                data.mch_name = cleanName;
            }

            const updated = await this.machineRepository.updateMachine(cmp_uuid, mch_uuid, data, options);
            if (!updated) {
                throw new Error("No se pudo actualizar la máquina.");
            }
            return this.formatMachine(updated);
        } catch (error: any) {
            console.error("Error en updateMachine (use case):", error.message);
            throw error;
        }
    }

    public async deleteMachine(cmp_uuid: string, mch_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !mch_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y mch_uuid válidos.");
            }

            const existing = await this.machineRepository.findMachineById(cmp_uuid, mch_uuid, options);
            if (!existing) {
                throw new Error(`No existe la máquina con ID: ${mch_uuid}`);
            }

            const deleted = await this.machineRepository.deleteMachine(cmp_uuid, mch_uuid, options);
            if (!deleted) {
                throw new Error("No se pudo eliminar la máquina.");
            }
            return this.formatMachine(deleted);
        } catch (error: any) {
            console.error("Error en deleteMachine (use case):", error.message);
            throw error;
        }
    }
}
