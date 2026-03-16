using System.ComponentModel.DataAnnotations;

namespace Crm_Gruppo_5.Dto
{
    public class PhoneNumberDto
    {
        public int PhoneNumberId { get; set; }
        public required string Number { get; set; }
        public string? Prefix { get; set; }
        public required string Nationality { get; set; }
    }
}
