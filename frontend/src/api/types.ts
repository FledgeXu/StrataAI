export type ApiEnvelope<T> = {
  code: number;
  message: string;
  data: T;
};

export class ApiError extends Error {
  public readonly code: number;

  constructor(message: string, code: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}
