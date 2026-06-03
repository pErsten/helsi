namespace Application.DTOs
{
    public class UpdateTaskListDto
    {
        public string OwnerId { get; set; }
        public string NewName { get; set; }
        public string NewTasks { get; set; }
    }
}
