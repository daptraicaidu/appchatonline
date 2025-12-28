using ChatApp.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace ChatApp.API.Data
{
    public class ChatDbContext : DbContext
    {
        public ChatDbContext(DbContextOptions<ChatDbContext> options) : base(options) { }

        public DbSet<ChatMessage> ChatMessages { get; set; }

        public DbSet<Feedback> Feedbacks { get; set; }
    }
}