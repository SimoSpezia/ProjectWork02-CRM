
namespace Crm_Gruppo_5.Dto
{
    public class CompanyDetailsDto : CompanyDto
    {
        public List<ContactDto>? Contacts { get; set; }
        public AddressDto? Address { get; set; }
    }
}