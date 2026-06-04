using MongoDB.Driver;
using Domain.Entities;

namespace Infrastructure
{
    public static class MongoDbCollections
    {
        public static IMongoCollection<TaskList> TaskLists(this IMongoDatabase dbContext) => dbContext.GetCollection<TaskList>("taskLists");
        public static IMongoCollection<TaskListShare> TaskListShares(this IMongoDatabase dbContext) => dbContext.GetCollection<TaskListShare>("taskListShares");
    }
}
