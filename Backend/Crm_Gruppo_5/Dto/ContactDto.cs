using CrmGruppo5.Data;
using System.ComponentModel.DataAnnotations;

namespace Crm_Gruppo_5.Dto
{
    public class ContactDto
    {
        public int ContactId { get; set; }
        [MaxLength(ValidationLengths.DefaultString)]
        public required string Name { get; set; }
        [MaxLength(ValidationLengths.DefaultString)]
        public required string Surname { get; set; }
        [MaxLength(ValidationLengths.DefaultString)]
        public string? Title { get; set; }
        [MaxLength(ValidationLengths.DefaultString)]
        public string? WorkRole { get; set; }
        [MaxLength(ValidationLengths.DefaultString)]
        public string? Gender { get; set; }
        public DateOnly? Birthday { get; set; }
        [MaxLength(ValidationLengths.LongText)]
        public string? Note { get; set; }
        [MaxLength(ValidationLengths.DefaultString)]
        public string? CompanyDenomination { get; set; }
    }
}
