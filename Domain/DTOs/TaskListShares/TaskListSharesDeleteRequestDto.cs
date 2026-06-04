namespace Domain.DTOs.TaskListShares
{
    public class TaskListSharesDeleteRequestDto
    {
        public string TaskListId { get; set; }
        public string CallerUserId { get; set; }
        public string SharedUserId { get; set; }
    }
}
