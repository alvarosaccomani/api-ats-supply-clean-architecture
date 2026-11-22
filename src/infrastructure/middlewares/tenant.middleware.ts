import { Request, Response, NextFunction } from "express";
import { SequelizeUserRolCompany } from "../model/user-rol-company/user-rol-company.model";
import { SequelizeRol } from "../model/rol/rol.model";

/**
 * Middleware para validar el aislamiento multi-tenancy.
 * Verifica que el usuario autenticado pertenezca a la empresa (`cmp_uuid`) especificada
 * en los parámetros, query, body o cabecera x-company-uuid de la solicitud.
 */
export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado.',
                error: 'Debe incluir el token de autorización para acceder a este recurso.'
            });
        }

        const cmp_uuid = (
            req.params.cmp_uuid ||
            req.body.cmp_uuid ||
            req.query.cmp_uuid ||
            req.headers['x-company-uuid']
        ) as string | undefined;

        // Si la petición no involucra una empresa específica, continuar
        if (!cmp_uuid || cmp_uuid.toLowerCase() === 'null' || cmp_uuid.toLowerCase() === 'undefined') {
            return next();
        }

        const usr_uuid = user.sub || user.usr_uuid;
        if (!usr_uuid) {
            return res.status(401).json({
                success: false,
                message: 'Token sin identificador de usuario válido.',
                error: 'El token proporcionado no contiene un sub o usr_uuid válido.'
            });
        }

        // Buscar si el usuario tiene asignación en la empresa
        const userRolCompany = await SequelizeUserRolCompany.findOne({
            where: {
                usr_uuid,
                cmp_uuid
            },
            include: [{ model: SequelizeRol, as: 'rol' }]
        });

        if (!userRolCompany) {
            // Verificar si el usuario cuenta con un rol global de administración
            const isSuperAdmin = await SequelizeUserRolCompany.findOne({
                where: { usr_uuid },
                include: [{
                    model: SequelizeRol,
                    as: 'rol',
                    where: { rol_name: ['superadmin', 'sysadmin', 'root', 'admin'] }
                }]
            });

            if (!isSuperAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado a la empresa.',
                    error: `El usuario no tiene permisos asignados para operar en la empresa ${cmp_uuid}.`
                });
            }
        }

        // Inyectar el contexto de tenant validado en la petición
        (req as any).tenant = {
            cmp_uuid,
            rol: (userRolCompany as any)?.rol?.dataValues || null
        };

        return next();
    } catch (error: any) {
        console.error('Error en tenantMiddleware:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error interno al validar multi-tenancy.',
            error: error.message
        });
    }
};

/**
 * Middleware estricto que exige obligatoriamente un cmp_uuid válido y verificado.
 */
export const requireTenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const cmp_uuid = (
        req.params.cmp_uuid ||
        req.body.cmp_uuid ||
        req.query.cmp_uuid ||
        req.headers['x-company-uuid']
    ) as string | undefined;

    if (!cmp_uuid || cmp_uuid.toLowerCase() === 'null' || cmp_uuid.toLowerCase() === 'undefined') {
        return res.status(400).json({
            success: false,
            message: 'Identificador de empresa no provisto.',
            error: 'Debe especificar un cmp_uuid en la URL, cuerpo, query o cabecera x-company-uuid.'
        });
    }

    return tenantMiddleware(req, res, next);
};
