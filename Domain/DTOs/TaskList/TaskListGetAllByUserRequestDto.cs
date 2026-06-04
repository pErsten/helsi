namespace Domain.DTOs.TaskList
{
    public class TaskListGetAllByUserRequestDto
    {
        public string UserId { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }
}
