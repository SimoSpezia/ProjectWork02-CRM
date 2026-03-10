namespace CrmGruppo5.Data
{
    public class MailAddress
    {
        public int MailAddressId { get; set; }
        public required string Mail { get; set; }
        public Contact? Contact { get; set; }
        public MailAddressType? MailAddressType { get; set; }
    }
}
