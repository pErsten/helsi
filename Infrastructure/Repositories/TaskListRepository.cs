using Application;
using Application.DTOs;
using Application.Repositories;
using Domain;
using Domain.Entities;
using MongoDB.Driver;
using System.Diagnostics;
using MongoDB.Bson;

namespace Infrastructure.Repositories
{
    public sealed class TaskListRepository : ITaskListRepository
    {
        private readonly IClientSessionHandle clientSessionHandle;
        private readonly IMongoCollection<TaskList> taskLists;
        private readonly IMongoCollection<TaskListShare> taskListShares;

        public TaskListRepository(IMongoDatabase dbContext, IClientSessionHandle clientSessionHandle)
        {
            this.clientSessionHandle = clientSessionHandle;
            taskLists = dbContext.TaskLists();
            taskListShares = dbContext.TaskListShares();
        }
        public async Task<Result<TaskListResponseDto>> GetAsync(TaskListRequestDto taskListRequestDto)
        {
            var taskListSharedId = await taskListShares
                .Find(x => x.UserId == taskListRequestDto.UserId && x.TaskListId == taskListRequestDto.Id && (x.Status == TaskListShareStatus.Owner || x.Status == TaskListShareStatus.Shared))
                .Project(x => (ObjectId?)x.TaskListId)
                .FirstOrDefaultAsync();
            if (taskListSharedId is null)
                return new Result<TaskListResponseDto>("fsjklgrjs");

            var taskList = await taskLists
                .Find(x => x.Id == taskListSharedId)
                .Project(x => new TaskListResponseDto
                {
                    Name = x.Name,
                    Tasks = x.Tasks
                })
                .FirstOrDefaultAsync();
            return taskList is null ? new Result<TaskListResponseDto>("fsgfhf") : new Result<TaskListResponseDto>(taskList);
        }

        public async Task<Result> CreateAsync(TaskListRequestDto taskListRequestDto)
        {
            clientSessionHandle.StartTransaction();
            try
            {
                var taskListId = taskLists
                    .Find(x => x.Id == taskListRequestDto.Id || (x.Name == taskListRequestDto.Name && x.OwnerId == taskListRequestDto.UserId))
                    .Project(x => x.Id)
                    .FirstOrDefaultAsync();
                if (taskListId is not null)
                    return new Result(Constants.TaskListAlreadyExists);

                var taskList = new TaskList
                {
                    Name = taskListRequestDto.Name,
                    OwnerId = taskListRequestDto.UserId,
                    CreatedUtc = DateTime.UtcNow,
                    LastUpdatedUtc = DateTime.UtcNow,
                    Status = TaskListStatus.Active
                };
                await taskLists.InsertOneAsync(taskList);
                await taskListShares.InsertOneAsync(new TaskListShare
                {
                    TaskListId = taskList.Id,
                    UserId = taskListRequestDto.UserId,
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

        public Task<Result> UpdateAsync(UpdateTaskListDto taskListDto)
        {
            throw new NotImplementedException();
        }

        public Task<Result> DeleteAsync(string taskId)
        {
            throw new NotImplementedException();
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
