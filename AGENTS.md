# Directrices de Arquitectura, Convenciones y Protocolo de Agentes - Backend API

Este documento establece las directrices obligatorias de Clean Architecture, Domain-Driven Design (DDD), convenciones de persistencia con PostgreSQL y Sequelize, tipado estricto, gestión transaccional atómica y el **protocolo mandatorio de confirmación por etapas con commits atómicos estandarizados** para el backend de la suite ATS Supply (`api-ats-supply-clean-architecture`). Todo asistente inteligente o agente (AntiGravity, Claude, DeepSeek Harness) DEBE validar y cumplir estas reglas.

---

## 0. Protocolo Mandatorio: Confirmación Previa, Planificación y Commits Atómicos

> ⚠️ **REGLA DE ORO PARA AGENTES:**
> 1. Queda terminantemente PROHIBIDO aplicar cambios en el código, crear o modificar archivos de forma directa sin antes:
>    - Presentar un **Plan de Trabajo Detallado por Etapas**.
>    - Solicitar y recibir la **confirmación / aprobación explícita** del usuario (*Halt & Confirm*).
> 2. **Commits Atómicos Obligatorios por Archivo:**
>    - Una vez aprobada la ejecución y finalizada la verificación, los commits de Git deben ejecutarse de forma **estrictamente individual y atómica** por cada archivo creado o modificado.
>    - Queda terminantemente PROHIBIDO realizar commits globales (`git add .` o `git commit -am "..."`).

### Flujo de Ejecución Obligatorio:

1. **Fase de Análisis y Propuesta (Plan por Etapas):**
   - Ante cualquier solicitud de feature, refactor o endpoint, el agente debe detallar:
     - **Etapa 1:** Alcance, tablas DDL (`atssupply.sql`), contratos de dominio (`.entity.ts`, `.repository.ts`, `.value.ts`, `index.ts`).
     - **Etapa 2:** Casos de uso (`application/`) y lógica de negocio (validaciones de multi-tenancy `cmp_uuid`, timezones, orquestación transaccional).
     - **Etapa 3:** Infraestructura (modelos Sequelize, repositorios transaccionales, controladores HTTP y rutas Express).
     - **Etapa 4:** Verificación estricta de compilación (`npm run lint:typecheck` o `npx tsc --noEmit --skipLibCheck true`).
     - **Etapa 5:** Ejecución ordenada de commits atómicos según la convención estricta.

2. **Punto de Detención (Halt & Confirm):**
   - El agente debe detener su ejecución y preguntar textualmente:
     > *"¿Deseas que proceda con la implementación de este plan o prefieres ajustar alguna etapa antes de comenzar?"*

3. **Ejecución Progresiva y Compilación:**
   - Una vez confirmada la aprobación por parte del usuario, se ejecutará el plan respetando estrictamente las etapas aprobadas.
   - Antes de realizar los commits, se valida que el proyecto compile sin advertencias ni errores.

---

## 0.1 Convención Estricta de Mensajes de Commit

Cada commit individual debe estructurarse siguiendo el patrón en inglés:

```bash
git add <ruta/al/archivo>
git commit -m "i <add|update> <nombre-archivo> into <carpeta-inmediata> folder into folder <carpeta-padre> [into folder <raiz>] to project"
```

### Reglas de Nomenclatura del Mensaje:
- Archivo creado por primera vez: usar **`i add <archivo> ...`**.
- Archivo modificado o refactorizado: usar **`i update <archivo> ...`**.
- La jerarquía de carpetas se desglosa desde el nivel más interno hacia el exterior, finalizando siempre con **`to project`**.

### Catálogo de Ejemplos Canónicos por Capa:

#### Capa de Dominio (`src/domain/`):
- `src/domain/<entidad>/<entidad>.entity.ts`:
  `git commit -m "i add <entidad>.entity.ts into <entidad> folder into folder domain to project"`
- `src/domain/<entidad>/<entidad>-<subentidad>.entity.ts`:
  `git commit -m "i add <entidad>-<subentidad>.entity.ts into <entidad> folder into folder domain to project"`
- `src/domain/<entidad>/<entidad>.value.ts`:
  `git commit -m "i add <entidad>.value.ts into <entidad> folder into folder domain to project"`
- `src/domain/<entidad>/<entidad>.repository.ts`:
  `git commit -m "i add <entidad>.repository.ts into <entidad> folder into folder domain to project"`
- `src/domain/<entidad>/index.ts`:
  `git commit -m "i add index.ts into <entidad> folder into folder domain to project"`

#### Capa de Infraestructura - Persistencia (`src/infrastructure/model/` y `repository/`):
- `src/infrastructure/model/<entidad>/<entidad>.model.ts`:
  `git commit -m "i add <entidad>.model.ts into <entidad> folder into folder model into folder infrastructure to project"`
- `src/infrastructure/model/<entidad>/<entidad>-<subentidad>.model.ts`:
  `git commit -m "i add <entidad>-<subentidad>.model.ts into <entidad> folder into folder model into folder infrastructure to project"`
- `src/infrastructure/model/<entidad>/index.ts`:
  `git commit -m "i add index.ts into <entidad> folder into folder model into folder infrastructure to project"`
- `src/infrastructure/repository/<entidad>/sequelize-<entidad>.repository.ts`:
  `git commit -m "i add sequelize-<entidad>.repository.ts into <entidad> folder into folder repository into folder infrastructure to project"`

#### Capa de Aplicación (`src/application/`):
- `src/application/<entidad>/<entidad>-use-case.ts`:
  `git commit -m "i add <entidad>-use-case.ts into <entidad> folder into folder application to project"`

#### Capa de Infraestructura - Transporte HTTP (`src/infrastructure/controller/` y `router/`):
- `src/infrastructure/controller/<entidad>/<entidad>.controller.ts`:
  `git commit -m "i add <entidad>.controller.ts into <entidad> folder into folder controller into folder infrastructure to project"`
- `src/infrastructure/router/<entidad>/<entidad>.route.ts`:
  `git commit -m "i add <entidad>.route.ts into <entidad> folder into folder router into folder infrastructure to project"`

### Secuencia Obligatoria de Commits:
Para garantizar la integridad del historial de Git (`git bisect` sin roturas), el orden de ejecución debe seguir estrictamente la jerarquía de dependencias:
1. Contratos de dominio (`.entity.ts`, subentidades, `.value.ts`, `.repository.ts`, `index.ts`).
2. Modelos de persistencia Sequelize (`.model.ts`, submodelos, `index.ts`).
3. Repositorios concretos de infraestructura (`sequelize-*.repository.ts`).
4. Casos de uso de aplicación (`*-use-case.ts`).
5. Controladores HTTP y rutas Express (`*.controller.ts`, `*.route.ts`).

---

## 1. Estructura de Capas (Clean Architecture & DDD)

El proyecto se organiza bajo la separación estricta de responsabilidades en tres capas concéntricas (`src/`):

```text
src/
├── domain/                                 # Capa de Dominio (Pura, agnóstica de frameworks)
│   ├── common/                             # Contratos genéricos transversales (Paginación, API results)
│   │   ├── pagination.interface.ts
│   │   ├── api-response.interface.ts
│   │   └── index.ts
│   └── <entidad>/                          # Carpeta por entidad en singular y kebab-case
│       ├── <entidad>.entity.ts             # Interfaz de la entidad principal
│       ├── <entidad>-<subentidad>.entity.ts# Entidades hijas / tablas asociadas (1 archivo por entidad)
│       ├── <entidad>.repository.ts         # Contrato / Puerto del repositorio
│       ├── <entidad>.value.ts              # Value Object con generación de UUID y timestamps
│       └── index.ts                        # Archivo de barril que reexporta el dominio completo
├── application/                            # Capa de Aplicación (Casos de Uso)
│   └── <entidad>/
│       └── <entidad>-use-case.ts           # Orquestación de lógica de negocio y timezones
└── infrastructure/                         # Capa de Infraestructura (Express, Sequelize, DB)
    ├── controller/                         # Controladores HTTP de Express
    │   └── <entidad>/<entidad>.controller.ts
    ├── db/                                 # Configuración y conexión Sequelize (PostgreSQL)
    ├── middlewares/                        # Middlewares (auth.middleware.ts, tenant.middleware.ts, etc.)
    │   ├── auth.middleware.ts
    │   ├── tenant.middleware.ts
    │   └── index.ts
    ├── model/                              # Modelos de persistencia de Sequelize
    │   └── <entidad>/                      # Modelos correspondientes a cada tabla de la BD
    │       ├── <entidad>.model.ts
    │       ├── <entidad>-<subentidad>.model.ts
    │       └── index.ts
    ├── repository/                         # Implementaciones concretas de los repositorios
    │   └── <entidad>/sequelize-<entidad>.repository.ts
    ├── router/                             # Rutas Express modulares (auto-cargadas dinámicamente)
    │   ├── <entidad>/<entidad>.route.ts
    │   └── index.ts                        # Cargador automático de rutas
    ├── services/                           # Adaptadores externos (Socket.io, Paginador, etc.)
    └── utils/                              # Utilidades transversales (TimezoneConverter, ImageOptimizer, etc.)
```

---

## 2. Reglas Estrictas del Dominio (`src/domain/`)

1. **Principio de Responsabilidad Única (SRP) en Entidades:**
   - **PROHIBIDO:** No agrupar múltiples entidades de tablas distintas en un solo archivo `.entity.ts`.
   - Cada tabla de base de datos debe tener su propio archivo de contrato:
     - Ejemplo: `product.entity.ts` (`prd_Products`), `product-price.entity.ts` (`prdprc_ProductPrices`), `price-tier.entity.ts` (`prct_PriceTiers`).
   - Cada carpeta de dominio debe incluir un archivo `index.ts` que reexporte todas sus entidades, el repositorio y el value object.

2. **Independencia de Infraestructura:**
   - La capa de dominio nunca debe importar módulos de Sequelize, Express ni librerías de transporte. Solo TypeScript puro, tipos básicos, librerías utilitarias de dominio (`uuid`, `moment`) y DTOs.

3. **Propagación del Contexto Transaccional y Opciones de Consulta en Repositorios:**
   - Toda firma de método de mutación o lectura en los contratos `*.repository.ts` debe admitir un parámetro opcional de opciones transaccionales y de consulta:
     ```typescript
     save(entity: ProductEntity, options?: QueryOptions): Promise<ProductEntity>;
     findById(prd_uuid: string, cmp_uuid: string, options?: QueryOptions): Promise<ProductEntity | null>;
     ```

---

## 3. Convenciones de Base de Datos & SQL (`atssupply.sql`)

Todo desarrollo debe sincronizarse con las definiciones de los scripts canónicos `atssupply.sql` y `base.sql`:

1. **Nomenclatura de Tablas y Prefijos:**
   - Toda tabla utiliza un prefijo temático de 3 o 4 letras en minúsculas seguido de la descripción en plural o CamelCase:
     - **Base Transversal:**
       - `cmp_` -> Empresas / Compañías (`cmp_Companies`)
       - `usr_` -> Usuarios (`usr_Users`)
       - `rol_` -> Roles (`rol_Roles`)
       - `itm_` -> Ítems y especialidades (`itm_Items`)
       - `mnu_` -> Menús de navegación (`mnu_Menus`)
       - `prm_` -> Permisos del sistema (`prm_Permissions`)
     - **Supply - Inventario y Precios:**
       - `prct_` -> Listas / Categorías de precios dinámicas (`prct_PriceTiers`)
       - `prd_` -> Productos terminados e insumos (`prd_Products`)
       - `prdprc_` -> Matriz de precios producto x categoría (`prdprc_ProductPrices`)
       - `stkm_` -> Libro mayor / Kardex de movimientos de stock (`stkm_StockMovements`)
     - **Supply - Producción:**
       - `mch_` -> Máquinas, cámaras o líneas de producción (`mch_Machines`)
       - `prdbom_` -> Receta / Lista de materiales BOM (`prdbom_ProductBom`)
       - `prdord_` -> Órdenes y partes de producción (`prdord_ProductionOrders`)
     - **Supply - Ventas, Reparto y Clientes:**
       - `cus_` -> Clientes con soporte de direcciones libres (`cus_Customers`)
       - `ord_` -> Cabecera de pedidos y cobranza (`ord_Orders`)
       - `ordd_` -> Detalle de ítems por pedido (`ordd_OrderDetails`)

2. **Identificadores y Claves Primarias:**
   - Claves primarias siempre con UUID tipo `VARCHAR(40)`: `<prefijo>_Uuid`.
   - En tablas operativas multi-tenant dependientes, utilizar claves compuestas: `PRIMARY KEY (cmp_Uuid, <prefijo>_Uuid)`.

3. **Aislamiento Multi-Tenant Obligatorio:**
   - Toda tabla operativa que pertenezca a una compañía DEBE incluir la columna `cmp_Uuid` como clave foránea y partición de aislamiento.
   - Todo query de lectura o mutación debe filtrar estrictamente por `cmp_Uuid`.
   - Todas las rutas que reciban o requieran `cmp_uuid` deben estar protegidas por `tenantMiddleware`.

4. **Campos de Auditoría:**
   - Cada tabla debe incluir `<prefijo>_CreatedAt` y `<prefijo>_UpdatedAt` configurados con valor por defecto `CURRENT_TIMESTAMP` y en Sequelize con `DataTypes.NOW`.

---

## 4. Capa de Aplicación (`src/application/`)

1. **Aislamiento Multi-Tenancy:**
   - Todo caso de uso debe recibir y validar el `cmp_uuid` activo desde el token/contexto de la petición, verificando que el recurso pertenezca a dicha empresa antes de mutarlo o retornarlo.

2. **Manejo Estricto de Fechas y Timezones:**
   - En base de datos se almacena en UTC (`TIMESTAMP`).
   - Las fechas expuestas hacia el cliente deben formatearse utilizando la utilidad canónica:
     ```typescript
     TimezoneConverter.toIsoStringInTimezone(date, 'America/Buenos_Aires')
     ```

3. **Orquestación de Transacciones Atómicas:**
   - Cuando un caso de uso orqueste múltiples mutaciones (ej: registrar pedido + actualizar stock + registrar kardex en `stkm_StockMovements`), debe coordinar la transacción a nivel de caso de uso:
     ```typescript
     const transaction = await this.sequelize.transaction();
     try {
       await this.orderRepository.createOrder(order, { transaction });
       await this.stockMovementRepository.createMovement(movement, { transaction });
       await transaction.commit();
     } catch (error) {
       await transaction.rollback();
       throw error;
     }
     ```

---

## 5. Capa de Infraestructura (`src/infrastructure/`)

1. **Auto-Carga de Rutas Express:**
   - El archivo `src/infrastructure/router/index.ts` auto-descubre las subcarpetas dentro de `router/` y ejecuta su función exportada por defecto:
     ```typescript
     export default configure<Entidad>Routes;
     ```
   - Al crear `router/<entidad>/<entidad>.route.ts`, queda automáticamente expuesta en el servidor.

2. **Seguridad, Tokens JWT y Tenant Guard:**
   - Toda ruta protegida debe incluir `authMiddleware`.
   - Toda ruta que involucre recursos de una empresa debe incluir obligatoriamente `tenantMiddleware` para prevenir acceso cruzado no autorizado.
   - El middleware inyecta los datos del usuario en `(req as any).user` y el tenant en `(req as any).tenant`.

3. **Formato Estándar de Respuesta HTTP:**
   - **Éxito unitario:** `{ success: true, message: string, data: T }`
   - **Listados paginados:**
     ```typescript
     {
       success: true,
       message: string,
       data: T[],
       item: number,
       itemOf: number,
       numElements: number,
       totalPages: number
     }
     ```
   - **Error controlado:** `{ success: false, message: string, error?: string }` con código HTTP correspondiente (400, 401, 403, 404, 500).

---

## 6. Verificación de Compilación y Calidad

Antes de considerar concluida cualquier tarea o proceder con los commits atómicos, el agente debe ejecutar obligatoriamente:

```bash
npm run lint:typecheck
```

Si el comando reporta errores de tipos, dependencias circulares o rutas rotas, el agente debe corregirlos de inmediato antes de realizar los commits y solicitar la confirmación final.
