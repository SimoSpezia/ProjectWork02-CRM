namespace CrmGruppo5.Data
{
    public class MailAddress
    {
        public int MailAddressId { get; set; }
        public required string Mail { get; set; }
        public int? ContactId { get; set; }
        public int? TypeId { get; set; }
    }
}
