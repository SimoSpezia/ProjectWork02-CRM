namespace CrmGruppo5.Data
{
    public class Address
    {
        public int AddressId { get; set; }
        public required string Country { get; set; }
        public string? Region { get; set; }
        public string? Province { get; set; }
        public required string City { get; set; }
        public required string Street { get; set; }
        public required string StreetNumber { get; set; }
    }
}
