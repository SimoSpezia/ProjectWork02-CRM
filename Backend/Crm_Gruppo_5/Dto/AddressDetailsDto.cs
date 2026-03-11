

namespace Crm_Gruppo_5.Dto
{
    public class AddressDetailsDto : AddressDto
    {
        public ContactDto? Contact { get; set; }
        public CompanyDto? Company { get; set; }
    }
}
