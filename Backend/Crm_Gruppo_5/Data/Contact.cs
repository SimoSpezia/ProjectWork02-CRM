namespace CrmGruppo5.Data
{
    public class Contact
    {
        public int ContactId { get; set; }
        public required string Name { get; set; }
        public required string Surname { get; set; }
        public string? Title { get; set; }
        public string? WorkRole { get; set; }
        public string? Gender { get; set; }
        public DateOnly? Birthday { get; set; }

        public Address? Address { get; set; }
        public Company? Company { get; set; } = null;
        public string? Note { get; set; }
        public required DateTime DateAdded { get; set; }
        public ContactType? ContactType { get; set; }
        public List<MailAddress>? MailAddresses { get; set; }
        public List<Category>? Categories { get; set; }
        public List<PhoneNumber>? PhoneNumbers { get; set; }
    }
}
