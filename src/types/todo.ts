export interface Todo {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TodoQuery {
  page?: number;
  per_page?: number;
  keyword?: string;
  done?: string;
  order?: string;
  desc?: string;
}

export interface TodoQueryDexie {
  page?: number;
  per_page?: number;
  keyword?: string;
  done?: boolean;
  order?: string;
  desc?: boolean;
}

export interface TodoPaginationRes {
  data: Todo[];
  current_page: number;
  prev_page: number;
  next_page: number;
  per_page: number;
  total: number;
}
