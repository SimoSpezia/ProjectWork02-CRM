using Crm_Gruppo_5.Data;
using Crm_Gruppo_5.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options => {
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(
                "https://projectwork-05-frontend-demo-g2asd9etb8gsdsaj.germanywestcentral-01.azurewebsites.net"
              )
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddSqlServer<ContactDbContext>(
    builder.Configuration.GetConnectionString("Default")
);
builder.Services.AddSingleton<Mapper>();

var app = builder.Build();


app.MapOpenApi();
app.MapScalarApiReference();

app.UseCors("FrontendPolicy");      
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();