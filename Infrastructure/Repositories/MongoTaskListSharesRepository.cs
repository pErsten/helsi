using Domain;
using Domain.DTOs;
using Domain.DTOs.TaskListShares;
using Domain.Entities;
using Domain.Repositories;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Infrastructure.Repositories
{
    public class MongoTaskListSharesRepository : ITaskListShareRepository
    {
        private readonly IClientSessionHandle clientSessionHandle;
        private readonly IMongoCollection<TaskList> taskLists;
        private readonly IMongoCollection<TaskListShare> taskListShares;

        public MongoTaskListSharesRepository(IMongoDatabase dbContext, IClientSessionHandle clientSessionHandle)
        {
            this.clientSessionHandle = clientSessionHandle;
            taskLists = dbContext.TaskLists();
            taskListShares = dbContext.TaskListShares();
        }

        public async Task<Result> CreateAsync(TaskListSharesCreateRequestDto dto)
        {
            if (dto.CallerUserId == dto.SharedUserId)
            {
                return new Result(Constants.TaskListShareOwnerAndSharedUserAreSame);
            }
            clientSessionHandle.StartTransaction();
            try
            {
                ObjectId.TryParse(dto.TaskListId, out var taskListId);
                var taskListSharedId = await taskListShares
                    .Find(x => x.UserId == dto.SharedUserId && x.TaskListId == taskListId && (x.Status == TaskListShareStatus.Owner || x.Status == TaskListShareStatus.Shared))
                    .Project(x => (ObjectId?)x.TaskListId)
                    .FirstOrDefaultAsync();
                if (taskListSharedId is not null)
                {
                    await clientSessionHandle.AbortTransactionAsync();
                    return new Result(Constants.TaskListShareAlreadyExists);
                }

                taskListSharedId = await taskListShares
                    .Find(x => x.UserId == dto.CallerUserId && x.TaskListId == taskListId && x.Status == TaskListShareStatus.Owner)
                    .Project(x => (ObjectId?)x.TaskListId)
                    .FirstOrDefaultAsync();
                if (taskListSharedId is null)
                {
                    await clientSessionHandle.AbortTransactionAsync();
                    return new Result(Constants.TaskListForbiddenAccessOrNotFound);
                }

                await taskListShares.InsertOneAsync(new TaskListShare
                {
                    TaskListId = taskListId,
                    UserId = dto.SharedUserId,
                    CreatedUtc = DateTime.UtcNow,
                    LastUpdatedUtc = DateTime.UtcNow,
                    Status = TaskListShareStatus.Shared
                });
                await clientSessionHandle.CommitTransactionAsync();
                return new Result();
            }
            catch (Exception ex)
            {
                await clientSessionHandle.AbortTransactionAsync();
                return new Result(ex.Message);
            }
        }

        public async Task<Result> DeleteAsync(TaskListSharesDeleteRequestDto dto)
        {
            clientSessionHandle.StartTransaction();
            try
            {
                ObjectId.TryParse(dto.TaskListId, out var taskListId);
                var taskListSharedId = await taskListShares
                    .Find(x => x.UserId == dto.CallerUserId && x.TaskListId == taskListId && (x.Status == TaskListShareStatus.Owner || x.Status == TaskListShareStatus.Shared))
                    .Project(x => new
                    {
                        Id = (ObjectId?)x.Id,
                        Status = x.Status
                    }) 
                    .FirstOrDefaultAsync();

                if (taskListSharedId is null)
                {
                    await clientSessionHandle.AbortTransactionAsync();
                    return new Result(Constants.TaskListShareNotFound);
                }
                if (taskListSharedId.Status is TaskListShareStatus.Shared && dto.CallerUserId != dto.SharedUserId)
                {
                    await clientSessionHandle.AbortTransactionAsync();
                    return new Result(Constants.TaskListShareUserCannotUnshareAnotherSharer);
                }
                if (taskListSharedId.Status is TaskListShareStatus.Owner)
                {
                    if (dto.CallerUserId == dto.SharedUserId)
                    {
                        await clientSessionHandle.AbortTransactionAsync();
                        return new Result(Constants.TaskListShareStatusNotShared);
                    }
                    taskListSharedId = await taskListShares
                        .Find(x => x.UserId == dto.SharedUserId && x.TaskListId == taskListId && x.Status == TaskListShareStatus.Shared)
                        .Project(x => new
                        {
                            Id = (ObjectId?)x.Id,
                            Status = x.Status
                        })
                        .FirstOrDefaultAsync();

                    if (taskListSharedId is null)
                    {
                        await clientSessionHandle.AbortTransactionAsync();
                        return new Result(Constants.TaskListShareNotFound);
                    }
                }

                var deleted = taskListShares
                    .FindOneAndUpdateAsync(
                        x => x.Id == taskListSharedId.Id && x.Status == taskListSharedId.Status,
                        Builders<TaskListShare>.Update
                            .Set(x => x.Status, TaskListShareStatus.Deleted)
                            .Set(x => x.LastUpdatedUtc, DateTime.UtcNow));
                if (deleted is null)
                {
                    await clientSessionHandle.AbortTransactionAsync();
                    return new Result(Constants.TaskListSharesNotFound);
                }

                await clientSessionHandle.CommitTransactionAsync();
                return new Result();
            }
            catch (Exception ex)
            {
                await clientSessionHandle.AbortTransactionAsync();
                return new Result(ex.Message);
            }
        }

        public async Task<Result<IEnumerable<TaskListAllSharesDto>>> GetAsync(TaskListSharesGetRequestDto dto)
        {
            var taskListIdDto = new ObjectId(dto.TaskListId);
            var taskListShareDtos = await taskListShares
                .Find(x => x.TaskListId == taskListIdDto && (x.Status == TaskListShareStatus.Owner || x.Status == TaskListShareStatus.Shared))
                .Project(x =>
                new TaskListAllSharesDto{
                    UserId = x.UserId,
                    Status = x.Status
                })
                .ToListAsync();

            if (!taskListShareDtos.Any(x => x.UserId == dto.UserId))
                return new Result<IEnumerable<TaskListAllSharesDto>>(Constants.TaskListSharesForbiddenAccess);
            return new Result<IEnumerable<TaskListAllSharesDto>>(taskListShareDtos);
        }
    }
}
