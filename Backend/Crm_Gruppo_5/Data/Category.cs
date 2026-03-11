namespace CrmGruppo5.Data
{
    public class Category
    {
        public int CategoryId { get; set; }
        public required string Description { get; set; }
        public List<Contact>? Contacts { get; set; }
    }
}
