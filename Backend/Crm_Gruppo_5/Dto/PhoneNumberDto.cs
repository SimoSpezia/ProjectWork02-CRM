using System.ComponentModel.DataAnnotations;

namespace Crm_Gruppo_5.Dto
{
    public class PhoneNumberDto
    {
        public int PhoneNumberId { get; set; }
        [MaxLength(ValidationLengths.DefaultString)]
        public required string Number { get; set; }
        [MaxLength(ValidationLengths.DefaultString)]
        public string? Prefix { get; set; }
        [MaxLength(ValidationLengths.DefaultString)]
        public required string Nationality { get; set; }
        public int? PhoneNumberTypeId { get; set; }
    }
}
