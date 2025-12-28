using ChatApp.API.Data;
using ChatApp.API.Hubs;
using ChatApp.API.Services;
//using ChatApp.API.Controllers;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình kết nối MySQL (Giữ nguyên như bạn đã làm ok)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ChatDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.Parse("8.0.30-mysql")));
builder.Services.AddSingleton<AdminSecurityService>();
builder.Services.AddControllers();
// 2. Add SignalR
builder.Services.AddSignalR();

// 3. Cấu hình CORS (QUAN TRỌNG NHẤT)
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // <--- CHÚ Ý: Đây là port của React
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // <--- Bắt buộc phải có dòng này với SignalR
    });
});

var app = builder.Build();

// 4. Middleware (Thứ tự cực kỳ quan trọng)
// app.UseHttpsRedirection(); // <--- Tạm thời comment dòng này để tránh lỗi SSL/Certificate khi dev local

app.UseRouting(); // Phải có Routing trước CORS

app.UseCors("ReactPolicy"); // <--- Kích hoạt Policy đã tạo ở trên

app.MapControllers();

app.MapHub<ChatHub>("/chatHub"); // Map đường dẫn Hub

app.Run();