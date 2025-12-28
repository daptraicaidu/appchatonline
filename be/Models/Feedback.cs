using System.ComponentModel.DataAnnotations;

namespace ChatApp.API.Models
{
    public class Feedback
    {
        [Key]
        public int Id { get; set; }
        public string User { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}