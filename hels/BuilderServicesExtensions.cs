using Api.TaskList.Create;
using Api.TaskList.Delete;
using Api.TaskList.Get;
using Api.TaskList.Update;
using Application.Repositories;
using FluentValidation;
using Infrastructure.Repositories;
using MongoDB.Driver;

namespace Api
{
    public static class BuilderServicesExtensions
    {
        public static WebApplication BuildApplication(this WebApplicationBuilder builder)
        {
            // Add services to the container.
            var services = builder.Services;
            var configuration = builder.Configuration;
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();

            // Validators
            services.AddValidatorsFromAssemblyContaining<TaskListCreateValidator>();
            services.AddValidatorsFromAssemblyContaining<TaskListGetValidator>();
            services.AddValidatorsFromAssemblyContaining<TaskListUpdateValidator>();
            services.AddValidatorsFromAssemblyContaining<TaskListDeleteValidator>();

            // DB configuration
            var mongoDbConnectionString = configuration.GetValue<string>("MongoDBConnectionString")!;
            var mongoDbNameString = configuration.GetValue<string>("MongoDBNameString")!;
            services.AddSingleton<IMongoClient>(c => new MongoClient(mongoDbConnectionString));
            services.AddSingleton<IMongoDatabase>(x => x.GetService<IMongoClient>().GetDatabase(mongoDbNameString));
            //services.AddSingleton(new MongoDbContext(mongoDbConnectionString, mongoDbNameString));
            services.AddScoped(x => x.GetService<IMongoClient>().StartSession());

            services.AddScoped<ITaskListRepository, MongoTaskListRepository>();

            return builder.Build();
        }
    }
}
