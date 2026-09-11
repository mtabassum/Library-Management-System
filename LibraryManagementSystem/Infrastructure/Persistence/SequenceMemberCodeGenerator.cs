using LibraryManagementSystem.Abstractions;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace LibraryManagementSystem.Infrastructure.Persistence;
    public sealed class SequenceMemberCodeGenerator : IMemberCodeGenerator
    {
        private const string Prefix = "M-";
        private const string SequenceName = "MemberCodeSeq";

        private readonly LibraryDbContext _db;
        public SequenceMemberCodeGenerator(LibraryDbContext db) => _db = db;

        public async Task<string> NextAsync(CancellationToken cancellationToken)
        {
            var connection = _db.Database.GetDbConnection();
            if (connection.State != ConnectionState.Open)
                await connection.OpenAsync(cancellationToken);

            await using var command = connection.CreateCommand();
            command.CommandText = $"SELECT NEXT VALUE FOR dbo.{SequenceName}";

            var raw = await command.ExecuteScalarAsync(cancellationToken);
            var number = Convert.ToInt32(raw);

            return $"{Prefix}{number:D4}";   // M-0001, M-0002, … M-9999, M-10000
        }
    }

