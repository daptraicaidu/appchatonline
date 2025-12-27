using System.ComponentModel.DataAnnotations;

namespace ChatApp.API.Models
{
    public class ChatMessage
    {
        [Key]
        public int Id { get; set; }
        public string User { get; set; } = string.Empty; // Tên người chat
        public string Message { get; set; } = string.Empty; // Nội dung
        public DateTime CreatedAt { get; set; } = DateTime.Now; // Thời gian
    }
}