export class ResponseBody {
    statusCode: number;
    message: string;
    data: any;
    success: boolean;
    constructor(statusCode?: number, message?: string, data?: any, success?: boolean) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = success;
    }
}

export const PipelinePagination = (skipPages: number, limit: string, order_by: string) => {
    return [
        {
            $skip: skipPages
        },
        {
            $limit: parseInt(limit) ? parseInt(limit) : 10
        },
        {
            $sort: {
                createdAt: order_by ? (order_by == 'asc' ? 1 : -1) : 1
            }
        }
    ]
}

