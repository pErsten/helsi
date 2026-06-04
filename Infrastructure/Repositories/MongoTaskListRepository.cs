using Application;
using Application.DTOs;
using Domain;
using Domain.DTOs;
using Domain.DTOs.TaskList;
using Domain.Entities;
using Domain.Repositories;
using MongoDB.Bson;
using MongoDB.Driver;

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
                .Find(x => x.UserId == taskListDto.UserId && x.TaskListId == taskListIdDto && (x.Status == TaskListShareStatus.Owner || x.Status == TaskListShareStatus.Shared))
                .Project(x => (ObjectId?)x.TaskListId)
                .FirstOrDefaultAsync();
            if (taskListSharedId is null)
                return new Result<TaskListResponseDto>(Constants.TaskListForbiddenAccessOrNotFound);

            var taskList = await taskLists
                .Find(x => x.Id == taskListSharedId && x.Status == TaskListStatus.Active)
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
                var taskListId = await taskLists
                    .Find(x => x.Name == taskListDto.Name && x.OwnerId == taskListDto.UserId && x.Status == TaskListStatus.Active)
                    .Project(x => (ObjectId?)x.Id)
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
                    Tasks = taskListDto.Tasks,
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
                    .Find(x => x.UserId == taskListDto.UserId && x.TaskListId == taskListIdDto && (x.Status == TaskListShareStatus.Owner || x.Status == TaskListShareStatus.Shared))
                    .Project(x => (ObjectId?)x.TaskListId)
                    .FirstOrDefaultAsync();
                if (taskListSharedId is null)
                {
                    await clientSessionHandle.AbortTransactionAsync();
                    return new Result(Constants.TaskListForbiddenAccessOrNotFound);
                }

                var updated = taskLists
                    .FindOneAndUpdateAsync(
                        x => x.Id == taskListSharedId && x.Status == TaskListStatus.Active,
                        Builders<TaskList>.Update
                            .Set(x => x.Name, taskListDto.NewName)
                            .Set(x => x.Tasks, taskListDto.NewTasks)
                            .Set(x => x.LastUpdatedUtc, DateTime.UtcNow));
                if (updated is null)
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
                var taskList = await taskLists
                    .FindOneAndUpdateAsync(
                        x => x.Id == taskListIdDto && x.Status == TaskListStatus.Active && x.OwnerId == taskListDto.UserId,
                        Builders<TaskList>.Update.Set(x => x.Status, TaskListStatus.Deleted));
                if (taskList is null)
                {
                    await clientSessionHandle.AbortTransactionAsync();
                    return new Result(Constants.TaskListNotFound);
                }

                var deleted = await taskListShares
                    .UpdateManyAsync(
                        x => x.TaskListId == taskList.Id && (x.Status == TaskListShareStatus.Owner || x.Status == TaskListShareStatus.Shared),
                        Builders<TaskListShare>.Update
                            .Set(x => x.Status, TaskListShareStatus.Deleted)
                            .Set(x => x.LastUpdatedUtc, DateTime.UtcNow));
                if (deleted.ModifiedCount <= 0)
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

        public async Task<Result<IEnumerable<TaskListByUserDto>>> GetByUserAsync(TaskListGetAllByUserRequestDto dto)
        {
            var taskListSharedIds = await taskListShares
                .Find(x => x.UserId == dto.UserId && (x.Status == TaskListShareStatus.Owner || x.Status == TaskListShareStatus.Shared))
                .Project(x => x.TaskListId)
                .ToListAsync();
            if (taskListSharedIds.Count == 0)
                return new Result<IEnumerable<TaskListByUserDto>>(Enumerable.Empty<TaskListByUserDto>());

            var taskList = await taskLists
                .Find(x => taskListSharedIds.Contains(x.Id) && x.Status == TaskListStatus.Active)
                .Skip(dto.Page * dto.PageSize)
                .Limit(dto.PageSize)
                .SortByDescending(x => x.CreatedUtc)
                .Project(x => new TaskListByUserDto
                {
                    Name = x.Name,
                    TaskListId = x.Id.ToString()
                })
                .ToListAsync();
            return new Result<IEnumerable<TaskListByUserDto>>(taskList);
        }
    }
}
