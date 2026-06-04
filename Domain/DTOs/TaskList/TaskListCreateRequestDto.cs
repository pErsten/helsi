namespace Domain.DTOs.TaskList
{
    public class TaskListCreateRequestDto
    {
        public string Name { get; set; }
        public string Tasks { get; set; }
        public string UserId { get; set; }
    }
}
