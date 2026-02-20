import { db } from "@/indexeddb";
import type { Todo, TodoQueryDexie } from "@/types/todo";
import { toSafeString } from "@/lib/public";

export const todoRepo = {
  async paginationTodos(q: TodoQueryDexie = {}) {
    try {
      const per_page =
        Number.isInteger(Number(q.per_page)) && Number(q.per_page) >= 1
          ? Number(q.per_page)
          : 5;

      const page =
        Number.isInteger(Number(q.page)) && Number(q.page) >= 1
          ? Number(q.page)
          : 1;

      const order = q.order === "updatedAt" ? "updatedAt" : "createdAt";

      const desc = q.desc !== false;

      const keyword = (q.keyword ?? "").trim().toLowerCase();

      const done = q.done === true || q.done === false ? q.done : undefined;

      let col = db.todos.toCollection();
      if (done === true || done === false) {
        col = col.filter((t: Todo) => t.done === done);
      }

      if (keyword) {
        col = col.filter((t: Todo) =>
          (t.title ?? "").toLowerCase().includes(keyword),
        );
      }

      const total = await col.count();

      let arr = await col.sortBy(order);
      if (desc) arr = arr.reverse();

      const start = (page - 1) * per_page;
      const data = arr.slice(start, start + per_page);

      return {
        success: true,
        data: {
          data,
          current_page: page,
          prev_page: page > 1 ? page - 1 : 1,
          next_page: page * per_page < total ? page + 1 : page,
          per_page,
          total,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: toSafeString(error),
      };
    }
  },

  // 新增
  async add(title: string) {
    try {
      const now = new Date().toISOString();
      await db.todos.add({
        id: crypto.randomUUID(),
        title,
        done: false,
        createdAt: now,
        updatedAt: now,
      });
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: toSafeString(error),
      };
    }
  },

  // 更新
  async update(id: string, title: string) {
    try {
      let res = await db.todos.update(id, {
        title,
        updatedAt: new Date().toISOString(),
      });
      if (res === 1) {
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          error: "更新資料不存在",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: toSafeString(error),
      };
    }
  },

  // 更新狀態
  async toggleDone(id: string, done: boolean) {
    try {
      let res = await db.todos.update(id, {
        done: done,
        updatedAt: new Date().toISOString(),
      });
      if (res === 1) {
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          error: "更新資料不存在",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: toSafeString(error),
      };
    }
  },

  // 刪除
  async delete(id: string) {
    try {
      await db.todos.delete(id);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: toSafeString(error),
      };
    }
  },

  // 清空全部
  async deleteAll() {
    try {
      await db.todos.clear();
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: toSafeString(error),
      };
    }
  },

  // 重置
  async reset() {
    try {
      await db.todos.clear();
      await seedTodos();
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: toSafeString(error),
      };
    }
  },
};

export async function seedTodos() {
  const HOUR = 60 * 60 * 1000;
  const count = 7;
  const now = Date.now();

  const initialTodos = Array.from({ length: count }, (_, i) => {
    const ts = now - (count - 1 - i) * HOUR;
    const iso = new Date(ts).toISOString();
    return {
      id: crypto.randomUUID(),
      title: `預設任務 ${i + 1}`,
      done: false,
      createdAt: iso,
      updatedAt: iso,
    };
  });

  await db.todos.bulkAdd(initialTodos);
}
