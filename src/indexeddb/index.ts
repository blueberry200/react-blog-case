import Dexie from "dexie";
import type { Table } from "dexie";
import type { Todo } from "@/types/todo";
import { seedTodos } from "@/pages/feature/listDataManagement/repo";

export class AppDB extends Dexie {
  todos!: Table<Todo>;
  constructor() {
    super("jerryDemoDB");
    this.version(1).stores({
      todos: "id, title, done, createdAt, updatedAt",
    });
    this.on("populate", async () => {
      await seedTodos();
    });
  }
}

export const db = new AppDB();
