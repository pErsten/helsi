using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class TaskListShare
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey("TaskListId")]
        public TaskList TaskList { get; set; }
        public int TaskListId { get; set; }
        
        [ForeignKey("UserId")]
        public User User { get; set; }
        public int UserId { get; set; }

        public TaskListShareStatus Status { get; set; }
        public DateTime CreatedUtc { get; set; }
        public DateTime LastUpdatedUtc { get; set; }
    }
}
