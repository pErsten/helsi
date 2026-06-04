using Application;
using Application.DTOs;
using Application.Repositories;
using Domain;
using Domain.Entities;
using MongoDB.Driver;
using MongoDB.Bson;
using Domain.DTOs.TaskList;

namespace Infrastructure.Repositories
{
    public sealed class MongoTaskListRepository : ITaskListRepository
    {
        private readonly IClientSessionHandle clientSessionHandle;
        private readonly IMongoCollection<TaskList> taskLists;
        private readonly IMongoCollection<TaskListShare> taskListShares;

        public MongoTaskListRepository(IMongoDatabase dbContext, IClientSessionHandle clientSessionHandle)
        {
            this.clientSessionHandle = clientSessionHandle;
            taskLists = dbContext.TaskLists();
            taskListShares = dbContext.TaskListShares();
        }
        public async Task<Result<TaskListResponseDto>> GetAsync(TaskListGetRequestDto taskListDto)
        {
            var taskListIdDto = new ObjectId(taskListDto.TaskListId);
            var taskListSharedId = await taskListShares
                .Find(x => x.UserId == taskListDto.OwnerId && x.TaskListId == taskListIdDto && (x.Status == TaskListShareStatus.Owner || x.Status == TaskListShareStatus.Shared))
                .Project(x => (ObjectId?)x.TaskListId)
                .FirstOrDefaultAsync();
            if (taskListSharedId is null)
                return new Result<TaskListResponseDto>(Constants.TaskListForbiddenAccessOrNotFound);

            var taskList = await taskLists
                .Find(x => x.Id == taskListSharedId)
                .Project(x => new TaskListResponseDto
                {
                    Name = x.Name,
                    Tasks = x.Tasks
                })
                .FirstOrDefaultAsync();
            return taskList is null ? new Result<TaskListResponseDto>(Constants.TaskListNotFound) : new Result<TaskListResponseDto>(taskList);
        }

        public async Task<Result> CreateAsync(TaskListCreateRequestDto taskListDto)
        {
            clientSessionHandle.StartTransaction();
            try
            {
                var taskListId = taskLists
                    .Find(x => x.Name == taskListDto.Name && x.OwnerId == taskListDto.UserId)
                    .Project(x => x.Id)
                    .FirstOrDefaultAsync();
                if (taskListId is not null)
                {
                    await clientSessionHandle.AbortTransactionAsync();
                    return new Result(Constants.TaskListAlreadyExists);
                }

                var taskList = new TaskList
                {
                    Name = taskListDto.Name,
                    OwnerId = taskListDto.UserId,
                    CreatedUtc = DateTime.UtcNow,
                    LastUpdatedUtc = DateTime.UtcNow,
                    Status = TaskListStatus.Active
                };
                await taskLists.InsertOneAsync(taskList);
                await taskListShares.InsertOneAsync(new TaskListShare
                {
                    TaskListId = taskList.Id,
                    UserId = taskListDto.UserId,
                    CreatedUtc = taskList.CreatedUtc,
                    LastUpdatedUtc = taskList.LastUpdatedUtc,
                    Status = TaskListShareStatus.Owner
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

        public async Task<Result> UpdateAsync(TaskListUpdateRequestDto taskListDto)
        {
            clientSessionHandle.StartTransaction();
            try
            {
                var taskListIdDto = new ObjectId(taskListDto.TaskListId);
                var taskListSharedId = await taskListShares
                    .Find(x => x.UserId == taskListDto.OwnerId && x.TaskListId == taskListIdDto && (x.Status == TaskListShareStatus.Owner || x.Status == TaskListShareStatus.Shared))
                    .Project(x => (ObjectId?)x.TaskListId)
                    .FirstOrDefaultAsync();
                if (taskListSharedId is null)
                {
                    await clientSessionHandle.AbortTransactionAsync();
                    return new Result(Constants.TaskListForbiddenAccessOrNotFound);
                }

                var taskListId = taskLists
                    .FindOneAndUpdateAsync(
                        x => x.Id == taskListSharedId,
                        Builders<TaskList>.Update
                            .Set(x => x.Name, taskListDto.NewName)
                            .Set(x => x.Tasks, taskListDto.NewTasks)
                            .Set(x => x.LastUpdatedUtc, DateTime.UtcNow));
                if (taskListId is null)
                {
                    await clientSessionHandle.AbortTransactionAsync();
                    return new Result(Constants.TaskListNotFound);
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

        public async Task<Result> DeleteAsync(TaskListDeleteRequestDto taskListDto)
        {
            clientSessionHandle.StartTransaction();
            try
            {
                var taskListIdDto = new ObjectId(taskListDto.TaskListId);
                var taskListSharedId = await taskListShares
                    .Find(x => x.UserId == taskListDto.OwnerId && x.TaskListId == taskListIdDto && (x.Status == TaskListShareStatus.Owner || x.Status == TaskListShareStatus.Shared))
                    .Project(x => (ObjectId?)x.TaskListId)
                    .FirstOrDefaultAsync();
                if (taskListSharedId is null)
                {
                    await clientSessionHandle.AbortTransactionAsync();
                    return new Result(Constants.TaskListForbiddenAccessOrNotFound);
                }

                var taskListId = taskLists
                    .FindOneAndDeleteAsync(x => x.Id == taskListSharedId);
                if (taskListId is null)
                {
                    await clientSessionHandle.AbortTransactionAsync();
                    return new Result(Constants.TaskListNotFound);
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

        public Task<Result<IEnumerable<TaskList>>> GetByUserAsync(string userId, int page, int pageSize)
        {
            throw new NotImplementedException();
        }

        public Task<Result<IEnumerable<TaskList>>> GetAllAsync(int page, int pageSize)
        {
            throw new NotImplementedException();
        }
    }
}
