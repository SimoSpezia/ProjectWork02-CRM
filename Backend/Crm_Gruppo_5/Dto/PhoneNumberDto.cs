using System.ComponentModel.DataAnnotations;

namespace Crm_Gruppo_5.Dto
{
    public class PhoneNumberDto
    {
        public int PhoneNumberId { get; set; }
        [MinLength(8)]
        public required string Number { get; set; }
        public string? Prefix { get; set; }
        [MinLength(4)]
        public required string Nationality { get; set; }
        public required int Priority { get; set; }
    }
}
