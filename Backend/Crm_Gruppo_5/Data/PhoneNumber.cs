namespace CrmGruppo5.Data
{
    public class PhoneNumber
    {
        public int PhoneNumberId { get; set; }
        public required string Number { get; set; }
        public string? Prefix { get; set; }
        public required string Nationality { get; set; }
        public Contact? Contact { get; set; }
        public PhoneNumberType? PhoneNumberType { get; set; }
        public required int Priority { get; set; }
    }
}
