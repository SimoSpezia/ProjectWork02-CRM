
namespace Crm_Gruppo_5.Dto
{
    public class PhoneNumberDetailsDto : PhoneNumberDto
    {
        public ContactDto? Contact { get; set; }
        public PhoneNumberTypeDto? PhoneNumberType { get; set; }
    }
}
