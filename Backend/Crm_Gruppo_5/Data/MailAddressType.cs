namespace CrmGruppo5.Data
{
    public class MailAddressType
    {
        public int MailAddressTypeId { get; set; }
        public required string Description { get; set; }
        public required int Priority { get; set; }
        public List<MailAddress>? Mails { get; set; }
    }
}
