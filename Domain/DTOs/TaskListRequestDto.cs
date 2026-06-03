using MongoDB.Bson;

namespace Application.DTOs;

public class TaskListRequestDto
{
    public ObjectId Id { get; set; }
    public string Name { get; set; }
    public string UserId { get; set; }
}