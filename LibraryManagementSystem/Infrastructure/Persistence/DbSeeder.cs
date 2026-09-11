using LibraryManagementSystem.Domain;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagementSystem.Infrastructure.Persistence;
    public static class DbSeeder
    {
        public static async Task SeedAsync(LibraryDbContext db, CancellationToken cancellationToken = default)
        {
            if (await db.Books.AnyAsync(cancellationToken))
                return;

            var books = BuildBooks();
            db.Books.AddRange(books);
            await db.SaveChangesAsync(cancellationToken); 

            db.BookCopies.AddRange(BuildCopies(books));
            db.Members.AddRange(BuildMembers());
            await db.SaveChangesAsync(cancellationToken);
        }

        private static List<Book> BuildBooks() => new()
    {
        new Book("Clean Code", "Robert C. Martin", "9780132350884", "Software Engineering", "Prentice Hall"),
        new Book("The Pragmatic Programmer", "Andrew Hunt", "9780201616224", "Software Engineering", "Addison-Wesley"),
        new Book("Design Patterns", "Erich Gamma", "9780201633610", "Software Engineering", "Addison-Wesley"),
        new Book("Refactoring", "Martin Fowler", "9780201485677", "Software Engineering", "Addison-Wesley"),
        new Book("Introduction to Algorithms", "Thomas H. Cormen", "9780262033848", "Computer Science", "MIT Press"),
        new Book("Database System Concepts", "Abraham Silberschatz", "9780073523323", "Databases", "McGraw-Hill"),
        new Book("Operating System Concepts", "Abraham Silberschatz", "9781118063330", "Operating Systems", "Wiley"),
        new Book("Computer Networking", "James Kurose", "9780133594140", "Networking", "Pearson"),
        new Book("Artificial Intelligence: A Modern Approach", "Stuart Russell", "9780136042594", "Artificial Intelligence", "Pearson"),
        new Book("Deep Learning", "Ian Goodfellow", "9780262035613", "Machine Learning", "MIT Press"),
        new Book("Python Crash Course", "Eric Matthes", "9781593279288", "Programming", "No Starch Press"),
        new Book("C# in Depth", "Jon Skeet", "9781617294532", "Programming", "Manning"),
        new Book("Head First Java", "Kathy Sierra", "9780596009205", "Programming", "O'Reilly"),
        new Book("You Don't Know JS", "Kyle Simpson", "9781491904244", "Programming", "O'Reilly"),
        new Book("JavaScript: The Good Parts", "Douglas Crockford", "9780596517748", "Programming", "O'Reilly"),
        new Book("SQL Performance Explained", "Markus Winand", "9783950307825", "Databases", "Markus Winand"),
        new Book("Modern Operating Systems", "Andrew S. Tanenbaum", "9780133591620", "Operating Systems", "Pearson"),
        new Book("Data Structures and Algorithms Made Easy", "Narasimha Karumanchi", "9788193245279", "Computer Science", "CareerMonk"),
        new Book("Cracking the Coding Interview", "Gayle Laakmann McDowell", "9780984782857", "Interview Preparation", "CareerCup"),
        new Book("System Design Interview", "Alex Xu", "9781736049112", "System Design", "ByteByteGo"),
        new Book("Clean Architecture", "Robert C. Martin", "9781924206531", "Architecture", "Prentice Hall"),
        new Book("Effective Modern C++", "Scott Meyers", "9782954504289", "Programming", "O'Reilly"),
        new Book("The Mythical Man-Month", "Frederick P. Brooks", "9780201835953", "Software Engineering", "Addison-Wesley"),
        new Book("Code Complete", "Steve McConnell", "9780735619678", "Software Engineering", "Microsoft Press"),
        new Book("Domain-Driven Design", "Eric Evans", "9780321125217", "Software Engineering", "Addison-Wesley"),
        new Book("The C Programming Language", "Brian W. Kernighan", "9780131103627", "Programming", "Prentice Hall"),
        new Book("Structure and Interpretation of Computer Programs", "Harold Abelson", "9780262510875", "Computer Science", "MIT Press"),
        new Book("Compilers: Principles, Techniques, and Tools", "Alfred V. Aho", "9780321486813", "Compilers", "Pearson"),
        new Book("The Art of Computer Programming, Vol. 1", "Donald E. Knuth", "9780201896831", "Computer Science", "Addison-Wesley"),
        new Book("Grokking Algorithms", "Aditya Bhargava", "9781617292231", "Programming", "Manning"),
    };

        private static List<BookCopy> BuildCopies(List<Book> books)
        {
            int[] plan = { 5, 4, 4, 3, 3, 3, 3, 3, 2, 2, 2, 2, 3, 2, 2, 3, 2, 2, 4, 3, 2, 3, 2, 2, 2, 2, 3, 2, 2, 3 };

            var copies = new List<BookCopy>();
            for (int i = 0; i < books.Count; i++)
            {
                var book = books[i];
                for (int seq = 1; seq <= plan[i]; seq++)
                {
                    var code = $"BC-{book.BookId:0000}-{seq:00}"; // e.g. BC-0001-01
                    copies.Add(BookCopy.CreateFor(book.BookId, code));
                }
            }
            return copies;
        }

        private static List<Member> BuildMembers()
        {
            string[] first =
            {
            "James","Mary","John","Patricia","Robert","Jennifer","Michael","Linda","William","Elizabeth",
            "David","Barbara","Richard","Susan","Joseph","Jessica","Thomas","Sarah","Christopher","Karen",
            "Daniel","Nancy","Matthew","Lisa","Anthony","Betty","Mark","Sandra","Donald","Ashley"
        };
            string[] last =
            {
            "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez",
            "Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin",
            "Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson"
        };
            string[] streets =
            {
            "Maple St","Oak Ave","Woodward Ave","Main St","Washington Blvd","Elm St",
            "Michigan Ave","Grand River Ave","Cedar St","Lincoln Ave","Pine St","Jefferson Ave"
        };
            (string City, string AreaCode, string Zip)[] places =
            {
            ("Detroit","313","48201"), ("Ann Arbor","734","48104"), ("Grand Rapids","616","49503"),
            ("Lansing","517","48933"), ("Flint","810","48502"), ("Kalamazoo","269","49007"),
            ("Troy","248","48083"), ("Warren","586","48089"), ("Dearborn","313","48124"),
            ("Livonia","734","48150"), ("Royal Oak","248","48067"), ("Saginaw","989","48602")
        };

            var members = new List<Member>();
            for (int i = 0; i < first.Length; i++)
            {
                var place = places[i % places.Length];
                var name = $"{first[i]} {last[i]}";
                var phone = $"({place.AreaCode}) 555-{100 + i:0000}";
                var address = $"{100 + i * 7} {streets[i % streets.Length]}, {place.City}, MI {place.Zip}";
                var code = $"M-{i + 1:D4}";
                members.Add(new Member(code, name, phone, address));
            }

            foreach (var idx in new[] { 4, 8, 11, 18, 22, 25 }) members[idx].Deactivate();

            return members;
        }
    }


