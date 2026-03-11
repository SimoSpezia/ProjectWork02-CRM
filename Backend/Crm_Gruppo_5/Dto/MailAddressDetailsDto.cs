
namespace Crm_Gruppo_5.Dto
{
    public class MailAddressDetailsDto : MailAddressDto
    {
        public ContactDto? Contact { get; set; }
        public MailAddressTypeDto? MailAddressType { get; set; }
    }
}
