using ChatApp.API.Data;
using ChatApp.API.Models;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.API.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ChatDbContext _context;

        public ChatHub(ChatDbContext context)
        {
            _context = context;
        }

        public async Task SendMessage(string user, string message)
        {
            // 1. Lưu vào Database
            var chatMessage = new ChatMessage
            {
                User = user,
                Message = message,
                CreatedAt = DateTime.Now
            };

            _context.ChatMessages.Add(chatMessage);
            await _context.SaveChangesAsync();

            // 2. Gửi cho tất cả client đang kết nối (Realtime)
            // "ReceiveMessage" là tên hàm mà phía React sẽ lắng nghe
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
    }
}