using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Diagnostics;
using Domain.Entities;

namespace Infrastructure
{
    public static class MongoDbCollections
    {
        public static IMongoCollection<TaskList> TaskLists(this IMongoDatabase dbContext) => dbContext.GetCollection<TaskList>("taskLists");
        public static IMongoCollection<TaskListShare> TaskListShares(this IMongoDatabase dbContext) => dbContext.GetCollection<TaskListShare>("taskListShares");
    }
}
