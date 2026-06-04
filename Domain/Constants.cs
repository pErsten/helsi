namespace Domain
{
    public class Constants
    {
        public const int MinTaskListNameLength = 1;
        public const int MaxTaskListNameLength = 255;
        public const int MinTaskListPageSize = 1;
        public const int MaxTaskListPageSize = 100;

        // Errors
        public const string TaskListAlreadyExists = "TaskList already exists";
        public const string TaskListForbiddenAccessOrNotFound = "TaskList or not found or user has no access to it";
        public const string TaskListSharesForbiddenAccess = "TaskList shares user has no access";
        public const string TaskListNotFound = "TaskList not found";
        public const string TaskListSharesNotFound = "TaskList shares not found";
        public const string TaskListShareAlreadyExists = "TaskList share already exists";
        public const string TaskListShareNotFound = "TaskList share not found";
        public const string TaskListShareStatusNotShared= "TaskList share status not shared";
        public const string TaskListShareOwnerAndSharedUserAreSame = "TaskList share owner and shared user are the same";
        public const string TaskListShareUserCannotUnshareAnotherSharer = "TaskList share user cannot unshare another sharer";
    }
}
