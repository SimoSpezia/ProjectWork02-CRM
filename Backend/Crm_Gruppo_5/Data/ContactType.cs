namespace CrmGruppo5.Data
{
    public class ContactType
    {
        public int ContactTypeId { get; set; }
        public required string Description { get; set; }
        public List<Contact>? Contacts { get; set; }
    }
}
