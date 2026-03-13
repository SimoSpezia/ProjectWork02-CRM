namespace CrmGruppo5.Data
{
    public class PhoneNumberType
    {
        public int PhoneNumberTypeId { get; set; }
        public required string Description { get; set; }
        public required int Priority { get; set; }
        public List<PhoneNumber>? Numbers { get; set; }
    }
}
