using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Domain.Entities
{
    public class TaskList
    {
        [BsonId]
        public ObjectId Id { get; set; }
        [BsonElement("name")]
        public string Name { get; set; }
        [BsonElement("ownerId")]
        public string OwnerId { get; set; }

        [BsonElement("tasks")]
        public string Tasks { get; set; }

        [BsonElement("status")]
        public TaskListStatus Status { get; set; }
        [BsonElement("createdUtc")]
        public DateTime CreatedUtc { get; set; }
        [BsonElement("lastUpdatedUtc")]
        public DateTime LastUpdatedUtc { get; set; }
    }
}