using System.Collections.Concurrent;

namespace ChatApp.API.Services
{
    public class AdminSecurityService
    {
        private readonly ConcurrentDictionary<string, List<DateTime>> _attempts = new();
        private const int MAX_ATTEMPTS = 5;

        public bool IsBlocked(string ip)
        {
            var now = DateTime.Now;
            var timestamps = _attempts.GetOrAdd(ip, new List<DateTime>());

            lock (timestamps)
            {
                // Xóa lịch sử cũ hơn 1 phút
                timestamps.RemoveAll(t => t < now.AddMinutes(-1));
                // Nếu đã sai quá 5 lần trong 1 phút -> Chặn
                return timestamps.Count >= MAX_ATTEMPTS;
            }
        }

        public void RegisterFailedAttempt(string ip)
        {
            var timestamps = _attempts.GetOrAdd(ip, new List<DateTime>());
            lock (timestamps)
            {
                timestamps.Add(DateTime.Now);
            }
        }
    }
}