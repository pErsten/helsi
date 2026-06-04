namespace Domain.DTOs.TaskList
{
    public class TaskListUpdateRequestDto
    {
        public string TaskListId { get; set; }
        public string UserId { get; set; }
        public string NewName { get; set; }
        public string NewTasks { get; set; }
    }
}
