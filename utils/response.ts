import {ErrorResponse, ErrorBody} from '../types/errors';

/**
 * Handle pagination parameters
 */
export function getPaginationParams(
    page: string = '1',
    limit: string = '10'
): { offset: number; limit: number; page: number } {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const offset = (pageNum - 1) * limitNum;

    return {
        offset,
        limit: limitNum,
        page: pageNum
    };
}

/**
 * standardized success response
 */
export function createSuccessResponse(data: any, message?: string) {
    return {
        success: true,
        data,
        ...(message && { message })
    };
}

/**
 * standardized paginated response
 */
export function createPaginatedResponse(
    data: any[],
    total: number,
    page: number,
    limit: number
) {
    return {
        success: true,
        data,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
        }
    };
}

export function createErrorResponse(error: ErrorBody, message?: string) : ErrorResponse {
    return {
        success: false,
        error,
        ...(message && { message })
    }
}
