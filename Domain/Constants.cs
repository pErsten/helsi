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
        public const string TaskListNotFound = "TaskList not found";
        public const string TaskListSharesNotFound = "TaskList shares not found";
    }
}
