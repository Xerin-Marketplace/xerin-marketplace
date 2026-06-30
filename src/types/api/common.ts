export type ID = string | number;

export type ApiMessageResponse = {
  message: string;
};

export type ApiErrorResponse = {
  detail?: string | Array<Record<string, unknown>>;
  message?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total?: number;
  skip?: number;
  limit?: number;
};

export type TimestampFields = {
  created_at?: string;
  updated_at?: string;
};
