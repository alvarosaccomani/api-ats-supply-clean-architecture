import { MachineEntity, MachineCreateInput, MachineUpdateData } from "./machine.entity";
import { QueryOptions } from "../common";

export interface MachineRepository {
    getMachines(cmp_uuid: string, options?: QueryOptions): Promise<MachineEntity[] | null>;
    getMachinesAndCount(cmp_uuid: string, options?: QueryOptions): Promise<{ count: number; rows: MachineEntity[] } | null>;
    findMachineById(cmp_uuid: string, mch_uuid: string, options?: QueryOptions): Promise<MachineEntity | null>;
    findMachineByName(cmp_uuid: string, mch_name: string, excludeUuid?: string | null, options?: QueryOptions): Promise<MachineEntity | null>;
    createMachine(machine: MachineCreateInput, options?: QueryOptions): Promise<MachineEntity | null>;
    updateMachine(cmp_uuid: string, mch_uuid: string, machine: MachineUpdateData, options?: QueryOptions): Promise<MachineEntity | null>;
    deleteMachine(cmp_uuid: string, mch_uuid: string, options?: QueryOptions): Promise<MachineEntity | null>;
}
