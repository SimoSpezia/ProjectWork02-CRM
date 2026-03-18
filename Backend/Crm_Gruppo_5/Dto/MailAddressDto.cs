using System.ComponentModel.DataAnnotations;

namespace Crm_Gruppo_5.Dto
{
    public class MailAddressDto
    {
        public int MailAddressId { get; set; }
        [MaxLength(ValidationLengths.Email)]
        public required string Mail { get; set; }
    }
}
