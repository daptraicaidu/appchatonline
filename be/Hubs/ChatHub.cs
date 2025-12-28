using ChatApp.API.Data;
using ChatApp.API.Models;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.API.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ChatDbContext _context;

        // Biến tĩnh để đếm số lượng kết nối (Lưu ý: Chỉ dùng cho server đơn lẻ)
        private static int _userCount = 0;

        public ChatHub(ChatDbContext context)
        {
            _context = context;
        }

        // 1. Xử lý khi có người kết nối
        public override async Task OnConnectedAsync()
        {
            _userCount++;
            // Gửi số lượng user mới cho TẤT CẢ mọi người
            await Clients.All.SendAsync("UpdateUserCount", _userCount);
            await base.OnConnectedAsync();
        }

        // 2. Xử lý khi có người ngắt kết nối
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _userCount--;
            if (_userCount < 0) _userCount = 0; // Đảm bảo không âm
            await Clients.All.SendAsync("UpdateUserCount", _userCount);
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string user, string message)
        {
            if (string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(message)) return;
            if (user.Length > 15 || message.Length > 1000) return;

            var chatMessage = new ChatMessage
            {
                User = user,
                Message = message,
                CreatedAt = DateTime.Now
            };

            _context.ChatMessages.Add(chatMessage);
            await _context.SaveChangesAsync();

            await Clients.All.SendAsync("ReceiveMessage", user, message, chatMessage.CreatedAt);
        }

        // 3. Hàm nhận Góp ý từ Client
        public async Task SendFeedback(string user, string content)
        {
            if (string.IsNullOrWhiteSpace(content)) return;

            var feedback = new Feedback
            {
                User = user,
                Content = content,
                CreatedAt = DateTime.Now
            };

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            // Không cần gửi lại cho client, chỉ cần lưu xuống DB là xong
        }
    }
}