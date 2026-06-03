using Api.TaskList.TaskListCreate;
using FluentValidation;
using Infrastructure;
using Microsoft.Extensions.Configuration;
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

            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            //services.AddOpenApi();
            services.AddValidatorsFromAssemblyContaining<TaskListCreateValidator>();

            var mongoDbConnectionString = configuration.GetValue<string>("MongoDBConnectionString")!;
            var mongoDbNameString = configuration.GetValue<string>("MongoDBNameString")!;
            services.AddSingleton<IMongoClient>(c => new MongoClient(mongoDbConnectionString));
            services.AddSingleton<IMongoDatabase>(x => x.GetService<IMongoClient>().GetDatabase(mongoDbNameString));
            //services.AddSingleton(new MongoDbContext(mongoDbConnectionString, mongoDbNameString));
            services.AddScoped(x => x.GetService<IMongoClient>().StartSession());

            return builder.Build();
        }
    }
}
