// ─── Primitives ───────────────────────────────────────────────────────────────
/** Header the .NET backend reads via HttpContext.GetUser() */
export const USER_ID_HEADER = 'X-User-Id';
// ─── Enums (mirrors Domain.Enums.TaskListShareStatus) ─────────────────────────
export var TaskListShareStatus;
(function (TaskListShareStatus) {
    TaskListShareStatus[TaskListShareStatus["None"] = 0] = "None";
    TaskListShareStatus[TaskListShareStatus["Owner"] = 1] = "Owner";
    TaskListShareStatus[TaskListShareStatus["Shared"] = 2] = "Shared";
    TaskListShareStatus[TaskListShareStatus["Deleted"] = 3] = "Deleted";
})(TaskListShareStatus || (TaskListShareStatus = {}));
// ─── Validation limits (mirrors Domain.Constants) ─────────────────────────────
export const TASK_LIST_NAME_MIN_LENGTH = 1;
export const TASK_LIST_NAME_MAX_LENGTH = 255;
export const TASK_LIST_PAGE_SIZE_MIN = 1;
export const TASK_LIST_PAGE_SIZE_MAX = 100;
//# sourceMappingURL=index.js.map