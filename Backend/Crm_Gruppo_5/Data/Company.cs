namespace CrmGruppo5.Data
{
    public class Company
    {
        public int CompanyId { get; set; }
        public required string Denomination { get; set; }
        public Address? Address { get; set; }
        public string? Website { get; set; }
        public required string VatNumber { get; set; }
        public string? Size { get; set; }
        public string? Note { get; set; }
        public List<Contact>? Contacts { get; set; }
    }
}
