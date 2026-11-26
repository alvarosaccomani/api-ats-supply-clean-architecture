import { CustomerMovementRepository } from "../../domain/customer-movement/customer-movement.repository";
import { CustomerMovementValue } from "../../domain/customer-movement/customer-movement.value";
import { CustomerMovementEntity, CustomerMovementType } from "../../domain/customer-movement/customer-movement.entity";
import { CustomerRepository } from "../../domain/customer/customer.repository";
import { OrderRepository } from "../../domain/order/order.repository";
import { OrderHistoryUseCase } from "../order-history/order-history-use-case";
import { QueryOptions } from "../../domain/common";
import { TimezoneConverter } from "../../infrastructure/utils/TimezoneConverter";

export interface RegisterCustomerMovementDTO {
    cmp_uuid: string;
    cus_uuid: string;
    usr_uuid: string;
    cusm_type: CustomerMovementType;
    cusm_amount: number;
    ord_uuid?: string | null;
    cusm_paymentmethod?: string | null;
    cusm_receiptnumber?: string | null;
    cusm_notes?: string | null;
}

export class CustomerMovementUseCase {
    constructor(
        private readonly customerMovementRepository: CustomerMovementRepository,
        private readonly customerRepository: CustomerRepository,
        private readonly orderRepository?: OrderRepository,
        private readonly orderHistoryUseCase?: OrderHistoryUseCase
    ) {
        this.getMovements = this.getMovements.bind(this);
        this.getMovementsAndCount = this.getMovementsAndCount.bind(this);
        this.getDetailMovement = this.getDetailMovement.bind(this);
        this.registerMovement = this.registerMovement.bind(this);
        this.getCustomerBalance = this.getCustomerBalance.bind(this);
    }

    private formatMovement(movement: CustomerMovementEntity) {
        return {
            cmp_uuid: movement.cmp_uuid,
            cusm_uuid: movement.cusm_uuid,
            cus_uuid: movement.cus_uuid,
            usr_uuid: movement.usr_uuid,
            cusm_type: movement.cusm_type,
            cusm_amount: Number(movement.cusm_amount),
            cusm_previousbalance: Number(movement.cusm_previousbalance),
            cusm_newbalance: Number(movement.cusm_newbalance),
            ord_uuid: movement.ord_uuid ?? null,
            cusm_paymentmethod: movement.cusm_paymentmethod ?? null,
            cusm_receiptnumber: movement.cusm_receiptnumber ?? null,
            cusm_notes: movement.cusm_notes ?? null,
            cusm_createdat: TimezoneConverter.toIsoStringInTimezone(movement.cusm_createdat, 'America/Buenos_Aires'),
            cusm_updatedat: TimezoneConverter.toIsoStringInTimezone(movement.cusm_updatedat, 'America/Buenos_Aires'),
            customer: movement.customer ? {
                cus_uuid: movement.customer.cus_uuid,
                cus_name: movement.customer.cus_name,
                cus_address: movement.customer.cus_address,
                cus_currentbalance: Number(movement.customer.cus_currentbalance) || 0
            } : undefined,
            user: movement.user ? {
                usr_uuid: movement.user.usr_uuid,
                usr_name: movement.user.usr_name,
                usr_surname: movement.user.usr_surname
            } : undefined,
            order: movement.order ? {
                ord_uuid: movement.order.ord_uuid,
                ord_totalamount: Number(movement.order.ord_totalamount),
                ord_status: movement.order.ord_status
            } : undefined
        };
    }

    public async getMovements(cmp_uuid: string, cus_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !cus_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y cus_uuid válidos.");
            }
            const movements = await this.customerMovementRepository.getMovements(cmp_uuid, cus_uuid, options);
            if (!movements) {
                return [];
            }
            return movements.map(m => this.formatMovement(m));
        } catch (error: any) {
            console.error("Error en getMovements (customer movement use case):", error.message);
            throw error;
        }
    }

    public async getMovementsAndCount(cmp_uuid: string, cus_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !cus_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y cus_uuid válidos.");
            }
            const result = await this.customerMovementRepository.getMovementsAndCount(cmp_uuid, cus_uuid, options);
            if (!result) {
                return { count: 0, rows: [] };
            }
            return {
                count: result.count,
                rows: result.rows.map(m => this.formatMovement(m))
            };
        } catch (error: any) {
            console.error("Error en getMovementsAndCount (customer movement use case):", error.message);
            throw error;
        }
    }

    public async getDetailMovement(cmp_uuid: string, cusm_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !cusm_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y cusm_uuid válidos.");
            }
            const movement = await this.customerMovementRepository.findMovementById(cmp_uuid, cusm_uuid, options);
            if (!movement) {
                return null;
            }
            return this.formatMovement(movement);
        } catch (error: any) {
            console.error("Error en getDetailMovement (customer movement use case):", error.message);
            throw error;
        }
    }

    public async registerMovement(input: RegisterCustomerMovementDTO, options?: QueryOptions) {
        try {
            const { cmp_uuid, cus_uuid, usr_uuid, cusm_type, cusm_amount, ord_uuid, cusm_paymentmethod, cusm_receiptnumber, cusm_notes } = input;
            if (!cmp_uuid || !cus_uuid || !usr_uuid) {
                throw new Error("cmp_uuid, cus_uuid y usr_uuid son campos obligatorios.");
            }

            const rawAmount = Number(cusm_amount);
            if (isNaN(rawAmount) || rawAmount <= 0) {
                throw new Error("El monto del movimiento debe ser un número positivo mayor a cero.");
            }

            // Validar existencia del cliente
            const customer = await this.customerRepository.findCustomerById(cmp_uuid, cus_uuid, options);
            if (!customer) {
                throw new Error(`El cliente con ID ${cus_uuid} no existe en la empresa.`);
            }

            // Normalización de signo contable:
            // Débitos (aumentan la deuda del cliente): ORDER_DEBIT, ADJUSTMENT_DEBIT
            // Créditos (reducen la deuda del cliente / pagos): PAYMENT_CREDIT, ADJUSTMENT_CREDIT, CANCEL_CREDIT
            let delta = rawAmount;
            if (cusm_type === 'PAYMENT_CREDIT' || cusm_type === 'ADJUSTMENT_CREDIT' || cusm_type === 'CANCEL_CREDIT') {
                delta = -rawAmount;
            }

            const previousBalance = Number(customer.cus_currentbalance) || 0.0;
            const newBalance = Number((previousBalance + delta).toFixed(2));

            const movementValue = new CustomerMovementValue({
                cmp_uuid,
                cus_uuid,
                usr_uuid,
                cusm_type,
                cusm_amount: rawAmount,
                cusm_previousbalance: previousBalance,
                cusm_newbalance: newBalance,
                ord_uuid: ord_uuid ?? null,
                cusm_paymentmethod: cusm_paymentmethod ?? null,
                cusm_receiptnumber: cusm_receiptnumber ?? null,
                cusm_notes: cusm_notes ?? null
            });

            // Registrar movimiento en el libro mayor
            const created = await this.customerMovementRepository.createMovement(movementValue, options);
            if (!created) {
                throw new Error("No se pudo asentar el movimiento en el libro mayor de cuenta corriente.");
            }

            // Actualizar saldo deudor actual en la ficha del cliente
            await this.customerRepository.updateCustomerBalance(cmp_uuid, cus_uuid, newBalance, options);

            // Asignación de pago a órdenes (Directa o FIFO)
            if (cusm_type === 'PAYMENT_CREDIT' && this.orderHistoryUseCase) {
                if (ord_uuid) {
                    // Pago asignado puntualmente a un pedido
                    await this.orderHistoryUseCase.recordTransition({
                        cmp_uuid,
                        ord_uuid,
                        usr_uuid,
                        ordh_previousstatus: 'CUENTA_CORRIENTE',
                        ordh_newstatus: 'CUENTA_CORRIENTE',
                        ordh_notes: `Pago de $${rawAmount} recibido en Cta. Cte.${cusm_receiptnumber ? ` (Recibo: ${cusm_receiptnumber})` : ''}${cusm_paymentmethod ? ` [${cusm_paymentmethod}]` : ''}`
                    }, options);
                } else if (this.orderRepository) {
                    // Pago global a cuenta: distribuir vía FIFO en órdenes pendientes de Cta. Cte.
                    const pendingOrders = await this.orderRepository.getCreditOrdersByCustomer(cmp_uuid, cus_uuid, options);
                    let remainingToAllocate = rawAmount;
                    for (const order of (pendingOrders || [])) {
                        if (remainingToAllocate <= 0) break;
                        const orderTotal = Number(order.ord_totalamount);
                        if (remainingToAllocate >= orderTotal) {
                            remainingToAllocate -= orderTotal;
                            await this.orderHistoryUseCase.recordTransition({
                                cmp_uuid,
                                ord_uuid: order.ord_uuid,
                                usr_uuid,
                                ordh_previousstatus: 'CUENTA_CORRIENTE',
                                ordh_newstatus: 'CUENTA_CORRIENTE',
                                ordh_notes: `Orden saldada al 100% por cobranza global en Cta. Cte. ($${orderTotal})${cusm_receiptnumber ? ` (Recibo: ${cusm_receiptnumber})` : ''}`
                            }, options);
                        } else {
                            const partialAllocated = remainingToAllocate;
                            remainingToAllocate = 0;
                            await this.orderHistoryUseCase.recordTransition({
                                cmp_uuid,
                                ord_uuid: order.ord_uuid,
                                usr_uuid,
                                ordh_previousstatus: 'CUENTA_CORRIENTE',
                                ordh_newstatus: 'CUENTA_CORRIENTE',
                                ordh_notes: `Pago parcial de $${partialAllocated} sobre $${orderTotal} recibido en Cta. Cte.${cusm_receiptnumber ? ` (Recibo: ${cusm_receiptnumber})` : ''}`
                            }, options);
                        }
                    }
                }
            }

            return this.formatMovement({
                ...created,
                customer: {
                    ...customer,
                    cus_currentbalance: newBalance
                }
            });
        } catch (error: any) {
            console.error("Error en registerMovement (customer movement use case):", error.message);
            throw error;
        }
    }

    public async getCustomerBalance(cmp_uuid: string, cus_uuid: string, options?: QueryOptions) {
        try {
            if (!cmp_uuid || !cus_uuid) {
                throw new Error("Debe proporcionar cmp_uuid y cus_uuid válidos.");
            }
            const customer = await this.customerRepository.findCustomerById(cmp_uuid, cus_uuid, options);
            if (!customer) {
                throw new Error(`El cliente con ID ${cus_uuid} no existe.`);
            }

            const lastMovement = await this.customerMovementRepository.getLastMovementByCustomer(cmp_uuid, cus_uuid, options);

            return {
                cus_uuid: customer.cus_uuid,
                cus_name: customer.cus_name,
                cus_currentbalance: Number(customer.cus_currentbalance) || 0.0,
                cus_hascredit: Boolean(customer.cus_hascredit),
                lastMovement: lastMovement ? this.formatMovement(lastMovement) : null
            };
        } catch (error: any) {
            console.error("Error en getCustomerBalance (customer movement use case):", error.message);
            throw error;
        }
    }
}
