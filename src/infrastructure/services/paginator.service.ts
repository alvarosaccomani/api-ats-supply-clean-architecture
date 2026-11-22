import { PaginationMeta } from "../../domain/common";

/**
 * Extracts limit and offset from page and perPage parameters for SQL / Sequelize queries.
 */
export function getPaginationQuery(page?: number | null, perPage?: number | null): { limit?: number; offset?: number } {
    if (!page || !perPage || page < 1 || perPage < 1) {
        return {};
    }
    const limit = Number(perPage);
    const offset = (Number(page) - 1) * limit;
    return { limit, offset };
}

/**
 * Builds metadata for paginated responses based on count and current page.
 */
export function buildPaginationMeta(
    totalCount: number,
    page: number = 1,
    perPage: number = 10,
    currentRowsLength?: number
): PaginationMeta {
    const safePage = Math.max(1, Number(page) || 1);
    const safePerPage = Math.max(1, Number(perPage) || 10);
    const totalPages = Math.ceil(totalCount / safePerPage) || 1;
    const offset = (safePage - 1) * safePerPage;

    const actualCountOnPage = currentRowsLength !== undefined 
        ? currentRowsLength 
        : Math.min(safePerPage, Math.max(0, totalCount - offset));

    const item = totalCount > 0 && actualCountOnPage > 0 ? offset + 1 : 0;
    const itemOf = totalCount > 0 && actualCountOnPage > 0 ? offset + actualCountOnPage : 0;

    return {
        page: safePage,
        perPage: safePerPage,
        item,
        itemOf,
        numElements: totalCount,
        totalPages,
        prePage: safePage > 1 ? safePage - 1 : null,
        nextPage: totalPages > safePage ? safePage + 1 : null,
        total: totalCount
    };
}

/**
 * Formats database findAndCountAll results into standard PaginatedResult.
 */
export function paginateDbResult<T>(
    result: { count: number; rows: T[] },
    page: number = 1,
    perPage: number = 10
) {
    const meta = buildPaginationMeta(result.count, page, perPage, result.rows.length);
    return {
        ...meta,
        data: result.rows
    };
}

/**
 * Formats an in-memory array into standard PaginatedResult with complete metadata.
 */
export function paginator(items: any[], page: number = 1, perPage: number = 10) {
    if (!Array.isArray(items)) {
        items = [];
    }
    const safePage = Math.max(1, Number(page) || 1);
    const safePerPage = Math.max(1, Number(perPage) || 10);
    const offset = (safePage - 1) * safePerPage;

    const paginatedItems = items.slice(offset, offset + safePerPage);
    let indexCounter = offset + 1;
    paginatedItems.forEach((item: any) => {
        if (item && typeof item === "object") {
            item["index"] = indexCounter++;
        }
    });

    const meta = buildPaginationMeta(items.length, safePage, safePerPage, paginatedItems.length);
    return {
        ...meta,
        data: paginatedItems
    };
}
