using ChatApp.API.Data;
using ChatApp.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ChatDbContext _context;
        private readonly AdminSecurityService _securityService;

        // TOKEN CỨNG (Hardcoded)
        private const string ADMIN_TOKEN = "7x9A2b4C8d1E6f3H5j0K9L8m2N4p6Q1R";

        public AdminController(ChatDbContext context, AdminSecurityService securityService)
        {
            _context = context;
            _securityService = securityService;
        }

        [HttpGet("feedbacks")]
        public async Task<IActionResult> GetFeedbacks([FromQuery] string token)
        {
            // 1. Lấy IP
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            // 2. Kiểm tra có bị chặn IP không
            if (_securityService.IsBlocked(ip))
            {
                return StatusCode(429, "Bạn đã thử sai quá nhiều lần. Vui lòng đợi 1 phút.");
            }

            // 3. Kiểm tra Token
            if (token != ADMIN_TOKEN)
            {
                // Ghi nhận lần thử sai
                _securityService.RegisterFailedAttempt(ip);
                return Unauthorized("Token không chính xác!");
            }

            // 4. Trả về dữ liệu (Mới nhất lên đầu)
            var feedbacks = await _context.Feedbacks
                                          .OrderByDescending(f => f.CreatedAt)
                                          .ToListAsync();
            return Ok(feedbacks);
        }
    }
}