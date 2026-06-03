using System.ComponentModel.DataAnnotations;

namespace Domain.Entities
{
    // Just a placeholder entity, there're only two fields because there's no listed logic in task for this, in production 
    public class User
    {
        [Key]
        public string Id { get; set; }
        public string? Name { get; set; }
    }
}
