using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Domain.Entities
{
    public class TaskListShare
    {
        [BsonId]
        public ObjectId Id { get; set; }
        [BsonElement("taskListId")]
        public ObjectId TaskListId { get; set; }
        [BsonElement("userId")]
        public string UserId { get; set; }

        [BsonElement("status")]
        public TaskListShareStatus Status { get; set; }
        [BsonElement("createdUtc")]
        public DateTime CreatedUtc { get; set; }
        [BsonElement("lastUpdatedUtc")]
        public DateTime LastUpdatedUtc { get; set; }
    }
}
