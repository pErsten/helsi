using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class TaskList
    {
        [Key]
        public Guid Id { get; set; }
        public string Name { get; set; }

        [ForeignKey("OwnerId")]
        public User Owner { get; set; }
        public Guid OwnerId { get; set; }

        public TaskListStatus Status { get; set; }
        public DateTime CreatedUtc { get; set; }
        public DateTime LastUpdatedUtc { get; set; }
    }
}