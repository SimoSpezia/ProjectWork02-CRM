namespace CrmGruppo5.Data
{
    public class Contact
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Surname { get; set; }
        public string? Title { get; set; }
        public string? WorkRole { get; set; }
        public string? Gender { get; set; }
        public required DateTime Birthday { get; set; }
        public required int AddressId { get; set; }
        public int CompanyId { get; set; } = -1;
        public string? Note { get; set; }
        public required DateTime DateAdded { get; set; }
        public required int ContactTypeId { get; set; }

        public List<Category>? Categories { get; set; }
    }
}
