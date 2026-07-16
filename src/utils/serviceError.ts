interface IServiceError {
	errCode: string
	message: string
	name: string
}

/**
 * Ошибка, произошедшая в сервисах
 */
export class ServiceError extends Error {
	public readonly code: string

	constructor(code: string, message: string) {
		super(message)

		this.name = "ServiceError"
		this.code = code.trim()

		Object.setPrototypeOf(this, ServiceError.prototype)
	}
}

/**
 * Обрабатывает ошибки, полученные в ходе выполнения методов сервисов
 * @param err Ошибка
 * @returns {IServiceError} объект с данными ошибки
 */
export function getServiceErrorData(err: unknown): IServiceError {
	if (err instanceof ServiceError)
		return {
			errCode: err.code,
			message: err.message,
			name: err.name
		}

	if (err instanceof Error)
		return {
			errCode: "SYSTEM_ERR",
			message: err.message,
			name: err.name
		}

	return {
		errCode: "UNKNOWN_ERR",
		message: String(err),
		name: "UnknownError"
	}
}
