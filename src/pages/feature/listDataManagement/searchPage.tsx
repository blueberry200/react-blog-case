import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import RcPagination from "rc-pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { todoRepo } from "./repo";
import { useMemo, useState, useEffect } from "react";
import type { Todo, TodoQuery, TodoPaginationRes } from "@/types/todo";
import { Loader2 } from "lucide-react";

function transUrlToUiParams(params: URLSearchParams) {
  // 排序升降冪
  let rawDesc = params.get("desc");
  // const desc = rawDesc !== "false";
  const desc = rawDesc === "false" ? "false" : "true";

  // 排序欄位
  let rawOrder = params.get("order");
  const order = rawOrder === "updatedAt" ? "updatedAt" : "createdAt";

  // 當前頁碼
  let rawPage = params.get("page");
  const page =
    Number.isInteger(Number(rawPage)) && Number(rawPage) >= 1
      ? Number(rawPage)
      : 1;

  // 每頁筆數
  let rawPerPage = params.get("per_page");
  const per_page =
    Number.isInteger(Number(rawPerPage)) && Number(rawPerPage) >= 1
      ? Number(rawPerPage)
      : 5;

  // 搜尋關鍵字
  let rawKeyword = params.get("keyword");
  const keyword = rawKeyword && rawKeyword.trim() ? rawKeyword.trim() : "";

  // 是否完成
  let rawDone = params.get("done");
  const done = rawDone === "true" || rawDone === "false" ? rawDone : "none";

  return {
    desc,
    order,
    page,
    per_page,
    keyword,
    done,
  };
}

function transUiParamsToSendApiParams(params: TodoQuery) {
  let sendApiParams = JSON.parse(JSON.stringify(params));

  if (!sendApiParams.keyword) {
    delete sendApiParams.keyword;
  } else {
    sendApiParams.keyword = sendApiParams.keyword.trim().toLowerCase();
  }

  if (sendApiParams.done === "true") {
    sendApiParams.done = true;
  } else if (sendApiParams.done === "false") {
    sendApiParams.done = false;
  } else {
    delete sendApiParams.done;
  }

  if (sendApiParams.desc === "false") {
    sendApiParams.desc = false;
  } else {
    sendApiParams.desc = true;
  }

  return sendApiParams;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [addOpen, setAddOpen] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const uiParams = useMemo(
    () => transUrlToUiParams(searchParams),
    [searchParams],
  );

  const [listData, setListData] = useState<TodoPaginationRes>({
    data: [],
    current_page: 1,
    prev_page: 1,
    next_page: 1,
    per_page: 5,
    total: 0,
  });
  const [keyword, setKeyword] = useState(uiParams.keyword);
  const [done, setDone] = useState(uiParams.done);
  const [order, setOrder] = useState(uiParams.order);
  const [desc, setDesc] = useState(uiParams.desc);

  const [loading, setLoading] = useState(false);

  const writeURL = async (patch: Partial<TodoQuery>) => {
    const next = {
      ...uiParams, // 以當前網址條件為基礎
      ...patch,
    };
    // 別把空字串塞進網址：清爽些
    const sp = new URLSearchParams();
    sp.set("desc", next.desc === "false" ? "false" : "true");
    sp.set("order", next.order);
    sp.set("page", String(next.page));
    sp.set("per_page", String(next.per_page));
    sp.set("done", next.done);

    if (next.keyword) sp.set("keyword", next.keyword);

    const nextStr = sp.toString();
    const currentStr = searchParams.toString();

    // 如果 query 完全一樣 → 強制重查
    if (nextStr === currentStr) {
      await fetchList(next);
      return;
    }

    // 不一樣 → 正常改 URL（useEffect 會重查）
    setSearchParams(sp, { preventScrollReset: true });
  };

  const onKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // 只取前 20 字
    setKeyword(val?.slice(0, 20)?.trim());
  };

  const onkeywordKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    e,
  ) => {
    if (loading) return;
    if (e.key === "Enter") {
      writeURL({
        keyword: keyword ? keyword.trim() : undefined,
        desc: desc,
        order: order,
        done: done,
        page: 1,
      });
    }
  };

  const onSearchClick = () => {
    writeURL({
      keyword: keyword ? keyword.trim() : undefined,
      desc: desc,
      order: order,
      done: done,
      page: 1,
    });
  };

  const onPageChange = (page: number) => {
    writeURL({ page });
  };

  const onAddClick = () => {
    setAddTitle("");
    setAddOpen(true);
  };

  const onEditClick = (todo: Todo) => {
    if (todo) {
      setEditId(todo.id);
      setEditTitle(todo.title);
      setEditOpen(true);
    }
  };

  const onDeleteClick = async (id: string) => {
    setLoading(true);
    const res = await todoRepo.delete(id);
    setLoading(false);
    if (res.success) {
      writeURL({ page: listData.current_page });
      toast.custom((t) => (
        <div className="flex items-center gap-3 rounded-md border border-green-500 bg-green-50 px-6 py-2 text-green-700 shadow">
          <div className="flex flex-col">
            <div className="text-sm font-medium">刪除成功</div>
          </div>
          <Button
            size="sm"
            className="ml-auto bg-green-600 hover:bg-green-700 text-white"
            onClick={() => toast.dismiss(t)}
          >
            關閉
          </Button>
        </div>
      ));
    } else {
      toast.custom((t) => {
        return (
          <div className="flex items-center gap-3 rounded-md border border-red-500 bg-red-50 px-6 py-2 text-red-700 shadow">
            <div className="flex flex-col">
              <div className="text-sm font-medium">刪除失敗</div>
              <div className="text-sm">{res.error}</div>
            </div>
            <Button
              size="sm"
              className="ml-auto bg-red-600 hover:bg-red-700 text-white"
              onClick={() => toast.dismiss(t)}
            >
              關閉
            </Button>
          </div>
        );
      });
    }
  };

  const onDeleteAllClick = async () => {
    setLoading(true);
    const res = await todoRepo.deleteAll();
    setLoading(false);
    if (res.success) {
      writeURL({ page: 1 });
      toast.custom((t) => (
        <div className="flex items-center gap-3 rounded-md border border-green-500 bg-green-50 px-6 py-2 text-green-700 shadow">
          <div className="flex flex-col">
            <div className="text-sm font-medium">清空全部成功</div>
          </div>
          <Button
            size="sm"
            className="ml-auto bg-green-600 hover:bg-green-700 text-white"
            onClick={() => toast.dismiss(t)}
          >
            關閉
          </Button>
        </div>
      ));
    } else {
      toast.custom((t) => {
        return (
          <div className="flex items-center gap-3 rounded-md border border-red-500 bg-red-50 px-6 py-2 text-red-700 shadow">
            <div className="flex flex-col">
              <div className="text-sm font-medium">清空全部失敗</div>
              <div className="text-sm font-medium">{res.error}</div>
            </div>
            <Button
              size="sm"
              className="ml-auto bg-red-600 hover:bg-red-700 text-white"
              onClick={() => toast.dismiss(t)}
            >
              關閉
            </Button>
          </div>
        );
      });
    }
  };

  const onResetClick = async () => {
    setLoading(true);
    const res = await todoRepo.reset();
    setLoading(false);
    if (res.success) {
      writeURL({ page: 1 });
      toast.custom((t) => (
        <div className="flex items-center gap-3 rounded-md border border-green-500 bg-green-50 px-6 py-2 text-green-700 shadow">
          <div className="flex flex-col">
            <div className="text-sm font-medium">重置成功</div>
          </div>
          <Button
            size="sm"
            className="ml-auto bg-green-600 hover:bg-green-700 text-white"
            onClick={() => toast.dismiss(t)}
          >
            關閉
          </Button>
        </div>
      ));
    } else {
      toast.custom((t) => {
        return (
          <div className="flex items-center gap-3 rounded-md border border-red-500 bg-red-50 px-6 py-2 text-red-700 shadow">
            <div className="flex flex-col">
              <div className="text-sm font-medium">重置失敗</div>
              <div className="text-sm">{res.error}</div>
            </div>
            <Button
              size="sm"
              className="ml-auto bg-red-600 hover:bg-red-700 text-white"
              onClick={() => toast.dismiss(t)}
            >
              關閉
            </Button>
          </div>
        );
      });
    }
  };

  const onToggleDoneClick = async (id: string, done: boolean) => {
    setLoading(true);
    const res = await todoRepo.toggleDone(id, done);
    setLoading(false);
    if (res.success) {
      writeURL({ page: listData.current_page });
      toast.custom((t) => (
        <div className="flex items-center gap-3 rounded-md border border-green-500 bg-green-50 px-6 py-2 text-green-700 shadow">
          <div className="flex flex-col">
            <div className="text-sm font-medium">更新完成狀態成功</div>
          </div>
          <Button
            size="sm"
            className="ml-auto bg-green-600 hover:bg-green-700 text-white"
            onClick={() => toast.dismiss(t)}
          >
            關閉
          </Button>
        </div>
      ));
    } else {
      toast.custom((t) => {
        return (
          <div className="flex items-center gap-3 rounded-md border border-red-500 bg-red-50 px-6 py-2 text-red-700 shadow">
            <div className="flex flex-col">
              <div className="text-sm font-medium">更新完成狀態失敗</div>
              <div className="text-sm font-medium">{res.error}</div>
            </div>
            <Button
              size="sm"
              className="ml-auto bg-red-600 hover:bg-red-700 text-white"
              onClick={() => toast.dismiss(t)}
            >
              關閉
            </Button>
          </div>
        );
      });
    }
  };

  const onAddSubmit = async () => {
    const title = addTitle.trim();
    if (!title) return;
    setLoading(true);
    const res = await todoRepo.add(title);
    setLoading(false);
    if (res.success) {
      setAddOpen(false);
      writeURL({ page: 1 });
      toast.custom((t) => (
        <div className="flex items-center gap-3 rounded-md border border-green-500 bg-green-50 px-6 py-2 text-green-700 shadow">
          <div className="flex flex-col">
            <div className="text-sm font-medium">新增成功</div>
          </div>
          <Button
            size="sm"
            className="ml-auto bg-green-600 hover:bg-green-700 text-white"
            onClick={() => toast.dismiss(t)}
          >
            關閉
          </Button>
        </div>
      ));
    } else {
      toast.custom((t) => {
        return (
          <div className="flex items-center gap-3 rounded-md border border-red-500 bg-red-50 px-6 py-2 text-red-700 shadow">
            <div className="flex flex-col">
              <div className="text-sm font-medium">新增失敗</div>
              <div className="text-sm font-medium">{res.error}</div>
            </div>
            <Button
              size="sm"
              className="ml-auto bg-red-600 hover:bg-red-700 text-white"
              onClick={() => toast.dismiss(t)}
            >
              關閉
            </Button>
          </div>
        );
      });
    }
  };

  const onEditSubmit = async () => {
    const title = editTitle.trim();
    if (!title) return;
    setLoading(true);
    const res = await todoRepo.update(editId, editTitle);
    setLoading(false);
    if (res.success) {
      setEditOpen(false);
      writeURL({ page: uiParams.page });
      toast.custom((t) => (
        <div className="flex items-center gap-3 rounded-md border border-green-500 bg-green-50 px-6 py-2 text-green-700 shadow">
          <div className="flex flex-col">
            <div className="text-sm font-medium">更新成功</div>
          </div>
          <Button
            size="sm"
            className="ml-auto bg-green-600 hover:bg-green-700 text-white"
            onClick={() => toast.dismiss(t)}
          >
            關閉
          </Button>
        </div>
      ));
    } else {
      toast.custom((t) => {
        return (
          <div className="flex items-center gap-3 rounded-md border border-red-500 bg-red-50 px-6 py-2 text-red-700 shadow">
            <div className="flex flex-col">
              <div className="text-sm font-medium">更新失敗</div>
              <div className="text-sm font-medium">{res.error}</div>
            </div>
            <Button
              size="sm"
              className="ml-auto bg-red-600 hover:bg-red-700 text-white"
              onClick={() => toast.dismiss(t)}
            >
              關閉
            </Button>
          </div>
        );
      });
    }
  };

  const fetchList = async (params: TodoQuery) => {
    setLoading(true);
    const res = await todoRepo.paginationTodos(
      transUiParamsToSendApiParams(params),
    );
    setLoading(false);

    if (res.success && res.data) {
      setListData(res.data);
    } else {
      toast.custom((t) => {
        return (
          <div className="flex items-center gap-3 rounded-md border border-red-500 bg-red-50 px-6 py-2 text-red-700 shadow">
            <div className="flex flex-col">
              <div className="text-sm font-medium">取得待辦清單失敗</div>
              <div className="text-sm font-medium">{res.error}</div>
            </div>
            <Button
              size="sm"
              className="ml-auto bg-red-600 hover:bg-red-700 text-white"
              onClick={() => toast.dismiss(t)}
            >
              關閉
            </Button>
          </div>
        );
      });
    }
  };

  useEffect(() => {
    (async () => {
      fetchList(uiParams);
    })();
  }, [uiParams]);

  return (
    <div className="w-full p-8">
      <div className="mb-4 flex flex-col gap-2">
        <div className="text-2xl font-black sm:text-3xl md:text-4xl">
          待辦清單
        </div>
        <div className="text-md italic text-gray-500">
          測試用資料，資料儲存在客戶端，歡迎測試畫面 UI～
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 border border-gray-400 rounded-2xl p-4 mb-4">
        <div className="flex flex-wrap w-full max-w-sm md:max-w-none gap-4">
          {/* q：關鍵字 */}
          <div className="w-60">
            <Input
              placeholder="輸入關鍵字後按 Enter"
              value={keyword ?? ""}
              onChange={onKeywordChange}
              onKeyDown={onkeywordKeyDown}
            />
          </div>
          <Select value={done} onValueChange={(val) => setDone(val)}>
            <SelectTrigger className="w-full max-w-48">
              <SelectValue placeholder="選擇完成狀態" />
            </SelectTrigger>
            <SelectContent
              className="
              bg-white 
              text-black
              **:data-highlighted:bg-blue-500
              **:data-highlighted:text-white
              **:data-[state=checked]:bg-blue-700
              **:data-[state=checked]:text-white
                **:data-disabled:opacity-50
              [&_[data-highlighted]_svg]:text-white
              [&_[data-state=checked]_svg]:text-white
                **:[[role=option]]:mt-1
                [&_[role=option][data-highlighted]]:ring-0
              "
            >
              <SelectGroup>
                <SelectLabel className="text-gray-500">完成狀態</SelectLabel>
                <SelectItem value="none">全部</SelectItem>
                <SelectItem value="true">已完成</SelectItem>
                <SelectItem value="false">未完成</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={order} onValueChange={(val) => setOrder(val)}>
            <SelectTrigger className="w-full max-w-48">
              <SelectValue placeholder="排序依據" />
            </SelectTrigger>
            <SelectContent
              className="
              bg-white 
              text-black
              **:data-highlighted:bg-blue-500
              **:data-highlighted:text-white
              **:data-[state=checked]:bg-blue-700
              **:data-[state=checked]:text-white
                **:data-disabled:opacity-50
              [&_[data-highlighted]_svg]:text-white
              [&_[data-state=checked]_svg]:text-white
                **:[[role=option]]:mt-1
                [&_[role=option][data-highlighted]]:ring-0
              "
            >
              <SelectGroup>
                <SelectLabel className="text-gray-500">排序依據</SelectLabel>
                <SelectItem value="createdAt">新增時間</SelectItem>
                <SelectItem value="updatedAt">更新時間</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={desc} onValueChange={(val) => setDesc(val)}>
            <SelectTrigger className="w-full max-w-48">
              <SelectValue placeholder="排序升降冪" />
            </SelectTrigger>
            <SelectContent
              className="
              bg-white 
              text-black
              **:data-highlighted:bg-blue-500
              **:data-highlighted:text-white
              **:data-[state=checked]:bg-blue-700
              **:data-[state=checked]:text-white
                **:data-disabled:opacity-50
              [&_[data-highlighted]_svg]:text-white
              [&_[data-state=checked]_svg]:text-white
                **:[[role=option]]:mt-1
                [&_[role=option][data-highlighted]]:ring-0
              "
            >
              <SelectGroup>
                <SelectLabel className="text-gray-500">排序升降冪</SelectLabel>
                <SelectItem value="true">由大到小</SelectItem>
                <SelectItem value="false">由小到大</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* 查詢按鈕 */}
        <div>
          <Button
            className="bg-blue-700 hover:bg-blue-800 text-white"
            onClick={onSearchClick}
            disabled={loading}
          >
            查詢
          </Button>
        </div>
      </div>
      <div className="flex gap-2 mb-2">
        <Button
          className="bg-blue-700 hover:bg-blue-800 text-white"
          onClick={() => {
            onAddClick();
          }}
          disabled={loading}
        >
          新增一筆
        </Button>
        <Button
          className="bg-red-700 hover:bg-red-800 text-white"
          onClick={() => {
            onDeleteAllClick();
          }}
          disabled={loading}
        >
          刪除全部
        </Button>
        <Button
          className="bg-red-700 hover:bg-red-800 text-white"
          onClick={() => {
            onResetClick();
          }}
          disabled={loading}
        >
          重置
        </Button>
      </div>
      <div className="rounded-lg border border-black overflow-hidden">
        <Table
          className="
            w-full
            [&_th]:border-l
            [&_td]:border-l
            [&_th:first-child]:border-l-0
            [&_td:first-child]:border-l-0
            [&_th]:bg-blue-700
            [&_th]:text-white
            [&_th]:font-semibold
          "
        >
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">標題</TableHead>
              <TableHead className="w-[100px]">是否完成</TableHead>
              <TableHead className="w-[200px]">建立時間</TableHead>
              <TableHead className="w-[200px]">更新時間</TableHead>
              <TableHead className="w-[200px]">操作</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!loading && listData.data.length > 0 ? (
              listData.data.map((todo) => (
                <TableRow key={todo.id}>
                  <TableCell className="font-medium">{todo.title}</TableCell>
                  <TableCell>{todo.done ? "是" : "否"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(todo.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(todo.updatedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        className="bg-blue-700 hover:bg-blue-800 text-white"
                        onClick={() => {
                          onEditClick(todo);
                        }}
                        disabled={loading}
                      >
                        編輯
                      </Button>
                      {todo.done ? (
                        <Button
                          className="bg-red-700 hover:bg-red-800 text-white"
                          onClick={() => {
                            onToggleDoneClick(todo.id, false);
                          }}
                          disabled={loading}
                        >
                          恢復未完成
                        </Button>
                      ) : (
                        <Button
                          className="bg-blue-700 hover:bg-blue-800 text-white"
                          onClick={() => {
                            onToggleDoneClick(todo.id, true);
                          }}
                          disabled={loading}
                        >
                          標記完成
                        </Button>
                      )}
                      <Button
                        className="bg-red-700 hover:bg-red-800 text-white"
                        onClick={() => {
                          onDeleteClick(todo.id);
                        }}
                        disabled={loading}
                      >
                        刪除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : !loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-30">
                  無資料
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-30">
                  <div className="flex items-center justify-center h-30">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-6 mb-10 flex justify-end">
        <RcPagination
          disabled={loading}
          locale={{
            jump_to: "前往",
            page: "頁",
          }}
          current={listData.current_page}
          total={listData.total}
          pageSize={listData.per_page}
          onChange={(page, _size) => {
            if (loading) return;
            onPageChange(page);
          }}
          showQuickJumper={true}
          showTotal={(total, [start, end]) =>
            `顯示 ${start}-${end} 筆，共 ${total} 筆`
          }
          itemRender={(_page, type, element) => {
            if (type === "page") return element;
            if (type === "prev") {
              return <ChevronLeft className="h-4 w-4" />;
            }
            if (type === "next") {
              return <ChevronRight className="h-4 w-4" />;
            }
            return element;
          }}
        />
      </div>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>新增待辦</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            <Input
              placeholder="輸入待辦標題（最多 20 字）"
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value.slice(0, 20))}
              disabled={loading}
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              className="bg-blue-700 hover:bg-blue-800 text-white"
              disabled={loading || !addTitle.trim()}
              onClick={() => onAddSubmit()}
            >
              新增
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>編輯待辦</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            <Input
              placeholder="輸入待辦標題（最多 20 字）"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value.slice(0, 20))}
              disabled={loading}
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              className="bg-blue-700 hover:bg-blue-800 text-white"
              disabled={loading || !editTitle.trim()}
              onClick={() => onEditSubmit()}
            >
              新增
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
